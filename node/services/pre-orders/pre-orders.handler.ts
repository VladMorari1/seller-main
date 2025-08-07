import type { ServiceContext } from '@vtex/api'
import { json } from 'co-body'

import type { Clients } from '../../clients'
import type {
  FulfillPreOrderItemsRequestDto,
  GetFiltersResponseDto,
  GetTotalsResponseDto,
  PagedResponse,
  PreOrderDto,
} from '../../types'
import { augmentedPreOrderDto } from './pre-orders.helper'
import {
  getMongoCredentials,
  getOrderId,
  getVtexAppSettings,
  sum,
} from '../../utils'
import { DbProduct, OrderProducts } from '../../types/payment'

export async function getPreOrders(
  context: ServiceContext<Clients>
): Promise<PagedResponse<PreOrderDto>> {
  const { page, pageSize, ...search } = context.query

  const pageInt = page ? Number(page) : 1
  const pageSizeInt = pageSize ? Number(pageSize) : 10

  const limit = pageSizeInt
  const offset = (pageInt - 1) * pageSizeInt
  const { data, ...paging } = await context.clients.preOrdersApi.listPreOrders(
    context,
    limit,
    offset,
    search
  )

  return {
    data: data.map(augmentedPreOrderDto),
    ...paging,
  }
}

export async function getSellerPercentage(
  context: ServiceContext<Clients>
): Promise<any> {
  const {
    clients: { sellerPercentageApi },
  } = context
  const config = await getMongoCredentials(context)
  console.log('---->',config);
  return sellerPercentageApi.getSellersPercent(context, {
    sellerIds: [config.username],
  })
}

export async function setSellerPercentage(
  context: ServiceContext<Clients>
): Promise<any> {
  const {
    clients: { sellerPercentageApi },
  } = context
  const body: { percent: number } = await json(context.req)

  const config = await getMongoCredentials(context)
  return sellerPercentageApi.setSellersPercent(context, {
    sellerId: config.username,
    percent: body.percent,
  })
}

export async function notifyUserByMail(
  context: ServiceContext<Clients>
): Promise<any> {
  const { orderId, items } = await json(context.req)
  const {
    clients: { marketplaceApi },
  } = context
  return marketplaceApi.notifyUser(orderId, items)
}

// PROCESS button
export async function fulfillPreOrderItems(
  context: ServiceContext<Clients>
): Promise<PreOrderDto> {
  const body: FulfillPreOrderItemsRequestDto = await json(context.req)
  const {
    clients: { paymentApi, marketplaceApi, transfersApi },
  } = context
  const config = await getMongoCredentials(context)

  const _orderId = getOrderId(body.orderId)
  try {
    // 1 get order by id
    const payment = await marketplaceApi.getMongoPayment(_orderId)
    if (typeof payment === 'string' || !payment) {
      throw new Error('Order not Found!')
    }

    // 2 Find these products in order by SKU ID and seller ID, and calculate how much we should recharge per product.
    const orderProducts = payment.products.reduce(
      (filteredProducts: OrderProducts[], product) => {
        const matchingItem = body.items.find(
          item =>
            String(item.skuId) === String(product.sellerStockKeepingUnitId) &&
            config.username.toLowerCase() === product.sellerId.toLowerCase()
        )
        if (matchingItem) {
          const itemPrice = Number(product.fullPrice) / product.quantity // 10 000
          // calc how much we should recharge preorder
          const rechargeValue = Math.round(
            matchingItem.quantity *
              itemPrice *
              (1 -
                (product.percent !== undefined && product.percent !== 0
                  ? product.percent / 100
                  : 0))
          )
          // Calc price-commission from 'rechargeValue' because from initial price was already got the %
          const rechargeCommission = Math.round(
            rechargeValue * (product.commission ? product.commission / 100 : 0)
          )

          const updatedProduct = {
            ...product,
            itemPrice,
            rechargeValue,
            rechargeCommission,
          }
          filteredProducts.push(updatedProduct)
        }
        return filteredProducts
      },
      []
    )
    // 3 calc how much should we charge user
    const rechargeSum = sum(orderProducts.map(e => e.rechargeValue))
    const rechargeCommission = sum(orderProducts.map(e => e.rechargeCommission))

    // 4 Stripe charge by method id
    const preorderStripePayment = await marketplaceApi.processStripePayment({
      payment_method: payment.paymentDetails?.paymentMethodId,
      orderId: _orderId,
      amount: rechargeSum,
      currency: payment.paymentDetails?.currency || 'aud',
      customer: payment.paymentDetails.customer,
    })

    // 5 update product info in mongoDb
    const updatedProducts: DbProduct[] = orderProducts.map(product => {
      const updatedCharged =
        Number(product.charged) + Number(product.rechargeValue)
      const updatedRemainingCharge =
        Number(product.remainingCharge) - Number(product.rechargeValue)
      return {
        charged: updatedCharged,
        remainingCharge: updatedRemainingCharge,
        skuId: product.skuId,
        sellerId: config.username,
        fullPrice: product.fullPrice,
        quantity: product.quantity,
        sellerStockKeepingUnitId: product.sellerStockKeepingUnitId,
        refunded: product.refunded,
        commission: product.commission,
        percent: product.percent,
      }
    })

    // After another stripe charge, the latest_charge param is updated, so we need to update this info in our db also
    const updatedSellerCharge = payment.sellersCharge.reduce((acc, curr) => {
      if (String(curr.sellerId).toLowerCase() === config.username.toLowerCase()) {
        acc.push({
          sellerId: config.username,
          lastChargeId: preorderStripePayment.latest_charge,
        })
      } else {
        acc.push(curr)
      }
      return acc
    }, [] as Array<{ sellerId: string | number; lastChargeId: string }>)

    // paidAmount value of entire order
    const updatedOrderPaidAmount = Number(payment.paidAmount) + rechargeSum

    await paymentApi.updateMongoOrder(context, {
      orderId: _orderId,
      updatedProducts,
      updatedOrderPaidAmount,
      sellersCharge: updatedSellerCharge,
    })

    const settings = await getVtexAppSettings(context)
    const { stripe_account_id } = settings
    const _amount = rechargeSum - rechargeCommission

    // Transfer money from marketplace to seller stripe account
    const paySellerResponse = await marketplaceApi.paySeller({
      amount: _amount,
      sellerStripeAccountId: stripe_account_id,
      currency: payment.paymentDetails?.currency || 'aud',
      description: { username: config.username, orderId: _orderId },
      lastChargeId: preorderStripePayment.latest_charge,
    })

    // Save transferInfo in MongoDb
    await transfersApi.saveTransferInfo({
      transactionId: paySellerResponse?.destination_payment,
      orderLink: `https://${config.username}.myvtex.com/admin/orders/${body.orderId}`,
      sellerId: config.username,
      amount: String(_amount),
      currency: payment.paymentDetails?.currency || 'aud',
      orderId: _orderId,
      description: `Marketplace transfer`,
      type: 'Payment',
    })
  } catch (e) {
    console.log('e', e)
    return e
  }

  const updatedOrder = await context.clients.preOrdersApi.fulfillPreOrderItems(
    context,
    'fulfill',
    body.orderId,
    body.items
  )

  return augmentedPreOrderDto(updatedOrder)
}

export async function cancelPreOrderItems(
  context: ServiceContext<Clients>
): Promise</* PreOrderDto */ any> {
  const body: FulfillPreOrderItemsRequestDto = await json(context.req)
  const {
    clients: { paymentApi, marketplaceApi, transfersApi },
  } = context
  const config = await getMongoCredentials(context)

  const orderId = getOrderId(body.orderId)

  // 1 Get order by id
  const order = await marketplaceApi.getMongoPayment(orderId).catch(e => {
    console.log('E--', e)
  })
  if (typeof order === 'string' || !order) {
    throw new Error('Order not Found!')
  }
  // 2 Accumulator, how much we should return to marketplace
  let refundSum = 0
  let marketPlaceRefundSum = 0
  // 3 Calc item price and update order details after refund
  const updatedProducts = order.products.reduce(
    (filteredProducts: DbProduct[], product) => {
      const matchingItem = body.items.find(
        item =>
          String(item.skuId) === String(product.sellerStockKeepingUnitId) &&
          config.username === product.sellerId
      )
      if (matchingItem) {
        let itemRefund = 0
        const itemPrice = Number(product.fullPrice) / product.quantity
        // Calc price per item - firstCharge %
        const firstChargedAmountPerProduct = Math.round(
          itemPrice * (product.percent / 100 || 0)
        )

        itemRefund += firstChargedAmountPerProduct * matchingItem.quantity
        marketPlaceRefundSum += itemRefund
        refundSum +=
          marketPlaceRefundSum * (1 - (product.commission / 100 || 0))
        const charged = Number(product.charged) - itemRefund
        const fullPrice =
          Number(product.fullPrice) - itemPrice * matchingItem.quantity
        const updatedProduct = {
          ...product,
          charged,
          remainingCharge: fullPrice - charged,
          fullPrice,
          quantity: product.quantity - matchingItem.quantity,
          ...(product.quantity - matchingItem.quantity === 0 && {
            refunded: true,
          }),
        }
        filteredProducts.push(updatedProduct)
      } else {
        filteredProducts.push(product)
      }
      return filteredProducts
    },
    []
  )

  // 4 Get transferId which was saved in mongo on RFH status
  const transfer = await paymentApi.getSellerStripeTransferId(
    context,
    config.username,
    orderId
  )
  // 5 transfer back money from seller stripe to marketplace stripe
  await marketplaceApi.reverseSellerTransfer(
    transfer.transferId,
    Math.round(refundSum)
  )
  // * Save reverse transferInfo in MongoDb
  await transfersApi.saveTransferInfo({
    transactionId: 'REFUND FOR PAYMENT',
    orderLink: `https://${config.username}.myvtex.com/admin/orders/${body.orderId}`,
    sellerId: config.username,
    amount: String(Math.round(refundSum)),
    currency: order.paymentDetails?.currency || 'aud',
    orderId,
    description: `Marketplace reverse transfer`,
    type: 'Payment Refund',
  })

  // 6 refund money to user from marketplace
  await marketplaceApi.refundUserMoney(
    order.paymentDetails.paymentIntentId,
    Math.round(refundSum)
  )
  // 7 Update modifications in mongoDb
  await paymentApi.updateMongoOrder(context, {
    orderId,
    updatedProducts,
    updatedOrderPaidAmount:
      Number(order.paidAmount) - Math.round(marketPlaceRefundSum),
    sellersCharge: order.sellersCharge,
  })

  const updatedOrder = await context.clients.preOrdersApi.fulfillPreOrderItems(
    context,
    'cancel',
    body.orderId,
    body.items
  )
  return augmentedPreOrderDto(updatedOrder)
}

export function getPreOrderTotals(
  context: ServiceContext<Clients>
): Promise<GetTotalsResponseDto> {
  return context.clients.preOrdersApi.getTotals(context)
}

export function getPreOrderFilters(
  context: ServiceContext<Clients>
): Promise<GetFiltersResponseDto> {
  return context.clients.preOrdersApi.getFilters(context)
}

export async function checkMissingPreOrders(context: ServiceContext<Clients>) {
  const {
    clients: { preOrdersApi, marketplaceApi, paymentApi, orderApi }
  } = context

  const stripes = await paymentApi.listPaymentIntents(context, 500, 0, undefined)
  let counterNotExist = 0
  let counterAll = stripes.length

  for(const stripe of stripes.data) {
    const uniqueSellers = stripe.products.reduce((acc: any[], current: any) => {
      const x = acc.find((item: any) => item.sellerId === current.sellerId);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    for(const seller of uniqueSellers) {
      const isExist = await preOrdersApi.checkPreorderByOrderNumber(context, {orderId: stripe.orderId, sellerId: seller.sellerId})

      if (!isExist) {
        const orders = await marketplaceApi.getOrdersByOrderNumber(stripe.orderId).catch(_err => {
          return []
        })

        const order = orders.find((d: any) => d.sellers.some((s: any) => s.id === seller.sellerId))

        if (order) {
          const orderDetails = await orderApi.getOrder(order.sellerOrderId)
            .catch(_err => {
              return null
            })

          if (orderDetails?.status === 'ready-for-handling') {
            // console.log({orderDetails})
            console.log('READY TO TRIGGER', order.sellerOrderId)
            counterNotExist++
            //await onReadyForHandling(context, stripe.orderId)
          }
        }
      }
    }
  }

  console.log({counterAll, counterNotExist})

  context.status = 200
  context.body = { counterAll, counterNotExist }

  return context.body
}
