import { EventContext, ServiceContext } from '@vtex/api'

import type { Clients, PreOrderClient, PreOrderItem } from '../types'
import { DbProduct } from '../types/payment'
import {
  arrayToObjectByProperty,
  copyProperties,
  getMongoCredentials,
  getOrderId,
  getVtexAppSettings,
  zipPropertiesOfArrayToObject,
} from '../utils'
import { addLog, createLogsSchema } from '../utils/logs'

const EventHandlersMap = {
  // 'start-handling': onStartHandling,
  canceled: onCancelled,
  'ready-for-handling': onReadyForHandling,
}

export async function orderCreatedBroadcastHandler(
  context: EventContext<Clients>,
  next: () => Promise<unknown>
): Promise<unknown> {
  const { orderId, currentState } = context.body

  // eslint-disable-next-line no-console
  console.log('Order broadcast handler', { orderId, currentState })
  try {
    await EventHandlersMap[currentState as keyof typeof EventHandlersMap]?.(
      context
    )
  } catch (e) {
    // TODO: implement error logging
  }

  return next()
}

async function onStartHandling(context: EventContext<Clients> | ServiceContext<Clients>, orderIdParam?: string) {
  let { orderId } = context.body

  if (orderIdParam) {
    orderId = orderIdParam
  }

  const { value, ...orderDetails } = await context.clients.omsApi.order(orderId)
  const config = await getMongoCredentials(context)
  const isPreorderAlreadyCreated = await context.clients.preOrdersApi.checkPreorder(
    context,
    { orderId, sellerId: config.username }
  )
  if (isPreorderAlreadyCreated) {
    return
  }
  const settings = await getVtexAppSettings(context)
  const reservationIds = [
    ...new Set(orderDetails.items.map(({ lockId }) => lockId)),
  ]
  const reservations = await Promise.all(
    reservationIds.map(reservationId =>
      context.clients.logisticsApi.getReservation(settings, reservationId)
    )
  )
  const reservationItems = reservations.map(({ LockId, SlaRequest }) => {
    const items = arrayToObjectByProperty(
      SlaRequest.map(({ item }) => ({
        ...item,
        id: Number(item.id),
      })),
      'id'
    )

    return { lockId: LockId, items }
  })

  const reservationMap = zipPropertiesOfArrayToObject(
    reservationItems,
    'lockId',
    'items'
  )

  const itemsNested: PreOrderItem[][] = orderDetails.items.map(
    ({ sellerSku, name, quantity, uniqueId, imageUrl, lockId, price }) => {
      const skuId = Number(sellerSku)
      const { warehouseId } = reservationMap[lockId][skuId]

      return Array.from({ length: quantity }).map(
        (_, index) =>
          <PreOrderItem>{
            orderItemId: `${uniqueId}++${index}`,
            reservationId: lockId,
            reservationWarehouseId: warehouseId,
            skuId,
            name,
            imageUrl,
            price,
          }
      )
    }
  )

  const items = (<PreOrderItem[]>[]).concat(...itemsNested)
  const client = <PreOrderClient>(
    copyProperties(
      orderDetails.clientProfileData,
      'email',
      'firstName',
      'lastName',
      'phone',
      'corporateName',
      'corporatePhone'
    )
  )
  // From order sku's list, check and ad only items with parameter 'isAvailableForPreorder':true
  const preordersList = await context.clients.skuWaresApi.checkProductListIsPreorders(
    context,
    {
      products: items.map(el => {
        return { skuId: String(el.skuId), sellerId: String(config.username) }
      }),
    }
  )
  const preorderItems = items.filter(curr => {
    const isItemPreorder = preordersList.find(
      (el: { skuId: string; isPreorder: boolean }) =>
        el.skuId === String(curr.skuId)
    )
    return isItemPreorder?.isPreorder
  })

  await context.clients.preOrdersApi.registerPreOrder(context, {
    orderId,
    items: preorderItems,
    client,
    value,
  })

  // Notify seller with email about new preorder
  const numbersOnly = orderId.match(/\d+-\d+/)
  const {
    clients: { marketplaceApi },
  } = context

  if (!numbersOnly[0]) {
    throw new Error('Invalid order id')
  }

  if (!settings?.notifications__emailList.length) {
    throw new Error('Empty email list')
  }

  await marketplaceApi.notifySeller(
    numbersOnly[0],
    settings.notifications__emailList,
    config.username
  )
}

// Here we get all money from marketplace for products [order/preorder]
export async function onReadyForHandling(context: EventContext<Clients> | ServiceContext<Clients>, orderIdParam?: string) {
  await createLogsSchema(context)

  let { orderId } = context.body

  try {
    if (orderIdParam) {
      orderId = orderIdParam
    }

    const _orderId = getOrderId(orderId)
    const {
      clients: { marketplaceApi, tokensApi, paymentApi, transfersApi },
    } = context

    addLog(context, {orderId,
      message: 'On Ready for handling hook called!',
      body:JSON.stringify(context.body)})

    const config = await getMongoCredentials(context)
    const order = await marketplaceApi.getOrder(orderId).catch(e => {
      console.log('Error : ',e)
      return {
        isError: true,
        data: (typeof e === 'string' || !e) ? e : 'Issue while fetching Order'
      }
    })

    if(order.isError){
      addLog(context, {orderId,
        message: 'Error while calling get Order API - onReadyForHanding',
        body:JSON.stringify(order)})
        return
    }

    // [1] Get payment (order) from mongoDb
    const payment = await marketplaceApi.getMongoPayment(_orderId).catch(e => {
      console.log('E--', e?.response?.data)
      addLog(context, {orderId,
        message: 'Error while fetching stripe payment details from mongo db - onReadyForHanding',
        body:JSON.stringify(e?.response?.data)})
    })

    if (typeof payment === 'string' || !payment) {
      addLog(context, {orderId: _orderId,
        message: 'Order not found! or issue - onReadyForHanding',
        body:JSON.stringify(payment)})
      throw new Error('Order not Found!')
    }
    // [2] Get only our products from order
    const mySellerProducts = payment.products.filter(
      product => product.sellerId === config.username
    )
    // [3] Check if all products are full paid
    // (if there are some preorders we need to save our stripe_account for future transactions)
    const fullPaidProducts: DbProduct[] = mySellerProducts.filter(
      product => Number(product.remainingCharge) === 0
    )
    const settings = await getVtexAppSettings(context,config.username)
    const { stripe_account_id } = settings
    const myLastChargeId = payment.sellersCharge.find(
      charge => charge.sellerId === config.username
    )

    // (if all products are full paid, we will charge right now marketplace and transfer money to seller-stripe account)
    if (fullPaidProducts.length !== mySellerProducts.length) {
      // if order has some preorder items we need to save our seller stripe account,
      // which will be used from Marketplace preorders app to process seller items
      await tokensApi
        .addStripeAccount(context, {
          sellerId: config.username,
          sellerStripeAccount: stripe_account_id,
        })
        .catch(e => {
          addLog(context, {orderId,
            message: 'Error while addding stripe account details to mongo db - onReadyForHanding',
            body:JSON.stringify(e?.response?.data)})
          return e?.response?.data
        })
    }
    // sum which seller will take and the commission amount will be left for marketplace
    let commissions:any = await marketplaceApi.getCommissions(config.username).catch((e)=>{
      console.log(e.response.data);
      return e?.response?.data
    });

    addLog(context, {orderId,
      message: 'Error while getting commissions from marketplace - onReadyForHanding',
      body:JSON.stringify(commissions)})

    let sumToCharge = Math.round(
      mySellerProducts.reduce((_SUM, item) => {
        const itemCharged = Number(item.charged)
        return (
          _SUM +
          (itemCharged -
            itemCharged * (item.commission ? item.commission / 100 : 0))
        )
      }, 0)
    )

    addLog(context, {orderId,
      message: 'sum to charge - onReadyForHanding',
      body:JSON.stringify(sumToCharge)})

    //cal shipping commission
    const shippingCommissionPercentage = commissions && commissions.length > 1 ? (commissions[0]?.freightCommissionPercentage ?? 0) : 0
    const shippingTaxPercentage:number = order.items[0].priceTags.filter((res: any)=> res.name.split('-')[0] === 'tax@shipping')[0]?.value ?? 0
    const shippingAmount = order.totals.filter((total: any)=> total.id === 'Shipping')[0]?.value/100 ?? 0
    const shippingAmountWithTax:number = shippingAmount * (1 + shippingTaxPercentage/100)
    const shippingWithTaxAfterSubCommission = shippingAmountWithTax * (1-shippingCommissionPercentage/100)

    addLog(context, {orderId,
      message: 'sum to charge with shipping + taxes deducting shipping commission - onReadyForHanding',
      body:JSON.stringify({
        shippingCommissionPercentage,
        shippingTaxPercentage,
        shippingAmount,
        shippingAmountWithTax,
        shippingWithTaxAfterSubCommission
      })})

    //updating the sumToCharge with the shippingWithTax after subsctracting the commission
    sumToCharge = sumToCharge + shippingWithTaxAfterSubCommission

    addLog(context, {orderId,
      message: 'sum to charge with shipping + taxes deducting shipping commission - onReadyForHanding',
      body:JSON.stringify(sumToCharge)})


    // make a transfer from marketplace to seller using next stripe documentation
    // lastChargeId=> https://stripe.com/docs/connect/separate-charges-and-transfers#transfer-availability
    const transfer = await marketplaceApi.paySeller({
      amount: sumToCharge,
      sellerStripeAccountId: stripe_account_id,
      currency: payment.paymentDetails?.currency || 'aud',
      description: { username: config.username, orderId: _orderId },
      lastChargeId: myLastChargeId ? myLastChargeId.lastChargeId : '',
    }).catch((e)=>{
      console.log('Trasfer to seller - ',e?.response?.data);
      return e?.response?.data
    })

    addLog(context, {orderId,
      message: 'sum to charge with shipping + taxes deducting shipping commission - onReadyForHanding',
      body:JSON.stringify(transfer)})

    // Save transferInfo in MongoDb
    const saveTansfer = await transfersApi.saveTransferInfo({
      transactionId: transfer?.destination_payment,
      orderLink: `https://${config.username}.myvtex.com/admin/orders/${orderId}`,
      sellerId: config.username,
      amount: String(sumToCharge),
      currency: payment.paymentDetails?.currency || 'aud',
      orderId: _orderId,
      description: `Marketplace transfer`,
      type: 'Payment',
    }).catch((e)=>{
      console.log(e.response)
      return e?.response?.data
    })

    addLog(context, {orderId,
      message: 'Save TranseferInfo in MongoDB - onReadyForHanding',
      body:JSON.stringify(saveTansfer)})

    // Save transferId in seller do be able to cancel items and return money
    const saveTransferId = await paymentApi.saveSellerStripeTransferId(context, {
      transferId: transfer.id,
      sellerId: config.username,
      orderId: _orderId,
    }).catch((e)=>{
      return e?.response?.data
    })

    addLog(context, {orderId: _orderId,
      message: 'Save transferId in seller Mongo DB- onReadyForHanding',
      body:JSON.stringify(saveTransferId)})

    await onStartHandling(context)
  }
  catch(err) {
    addLog(context, {
      orderId,
      message: 'Try/Catch error in the onReadyForHandling function',
      body: err.message
    })
  }
}

// Cancel order from All orders app
async function onCancelled(context: EventContext<Clients>) {
  const { orderId } = context.body
  // const config = await getMongoCredentials(context)
  // const {
  //   clients: { paymentApi },
  // } = context
  // const settings = await getVtexAppSettings(context)
  // const { stripe__sk } = settings
  // const extractedNumber = getOrderId(orderId)
  //
  // let amountToBeRefund = 0
  // try {
  //   const payment = await paymentApi.getPayment(context, {
  //     orderId: extractedNumber,
  //     key: password__encryption,
  //   })
  //   if (typeof payment === 'string') {
  //     throw new Error('Order not Found!')
  //   }
  //   const filteredProducts = payment.products
  //     .filter(
  //       product => product.sellerId === config.username && !product.refunded
  //     )
  //     .map(product => {
  //       amountToBeRefund += Number(product.charged)
  //       return { skuId: product.skuId, sellerId: product.sellerId }
  //     })
  //
  //   await paymentApi.refund(context, {
  //     orderId: payment.orderId,
  //     refundedProducts: filteredProducts,
  //   })
  //   if (amountToBeRefund) {
  //     const stripe = new Stripe(stripe__sk, {
  //       apiVersion: '2022-11-15',
  //     })
  //     await stripe.refunds.create({
  //       payment_intent: payment?.stripeDetails?.paymentIntentId,
  //       amount: Number(amountToBeRefund),
  //     })
  //   }
  // } catch (e) {
  //   return e
  // }

  // TODO: mark all order items for cancellation
  await context.clients.preOrdersApi.fulfillPreOrderItems(
    context,
    'cancel',
    orderId,
    []
  )
}
