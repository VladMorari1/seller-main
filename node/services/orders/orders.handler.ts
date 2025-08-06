import type { ServiceContext } from '@vtex/api'

import type { Clients } from '../../clients'
import { augmentedPreOrderDto } from '../pre-orders/pre-orders.helper';

async function getOrderDetails(ctx: ServiceContext<Clients>, orderId: string) {
  const {
    clients: {orderApi}
} = ctx;

   const order = await orderApi.getOrder(orderId)
   return order
}

export async function getAllOrders(context: ServiceContext<Clients>) {
  const { page, pageSize, ...search } = context.query

  const pageInt = page ? Number(page) : 1
  const pageSizeInt = pageSize ? Number(pageSize) : 10

  const limit = pageSizeInt
  const offset = (pageInt - 1) * pageSizeInt

  console.log({search})

  const { data, ...paging } = await context.clients.preOrdersApi.listAllOrders(
    context,
    limit,
    offset,
    search
  )

  const dataWithOrderDetails: any[] = []

  for(const order of data) {
    const orderDetails = await getOrderDetails(context, order.orderId)

    dataWithOrderDetails.push({
      ...order,
      items: (orderDetails.items as Array<any>).map((product: any) => {
        const preorderItem = (order.items as Array<any>).find((item: any) => product.sellerSku === String(item.skuId))

        return {
          id: product.id,
          imageUrl: product.imageUrl,
          price: product.price,
          refId: product.refId,
          quantity: product.quantity,
          name: product.name,
          preorderDetails: preorderItem,
        }
      }),

      // items: (order.items as Array<any>).map((product: any) => {
      //   const skuDetails = orderDetails.items.find((item: any) => item.sellerSku === String(product.skuId))

      //   return {
      //     ...product,
      //     skuDetails: {
      //       refId: skuDetails?.refId,
      //       quantity: skuDetails?.quantity,
      //       price: skuDetails?.price,
      //     }
      //   }
      // }),
      orderDetails: {
        status: orderDetails.status,
        items: orderDetails.items,
        totals: orderDetails.totals,
      }
    })
  }

  return {
    data: dataWithOrderDetails.map(augmentedPreOrderDto),
    ...paging,
  }
}
