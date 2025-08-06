import axios from 'axios'

import type {
  GetPreordersResponse,
  PreordersTotals,
  PreordersFiltersProps,
} from '../types/preordersTypes'
import { OrdersFiltersProps } from '../types/ordersTypes'

export const getAllOrders = ({
  page,
  pageSize,
  query,
  filters,
}: {
  filters?: OrdersFiltersProps
  pageSize?: number
  page?: number
  query?: string
}): Promise<GetPreordersResponse> =>
  axios
    .get('/poa/orders', {
      params: {
        page,
        pageSize,
        ...(query && { query }),
        filters: {
          ...(filters?.createdAt && {
            createdAt: filters.createdAt,
          }),
        },
      },
    })
    .then(response => {
      return response.data
    })

export const getPreorders = ({
  page,
  pageSize,
  query,
  filters,
}: {
  filters?: PreordersFiltersProps
  pageSize?: number
  page?: number
  query?: string
}): Promise<GetPreordersResponse> =>
  axios
    .get('/poa/pre-orders', {
      params: {
        page,
        pageSize,
        ...(query && { query }),
        filters: {
          ...(filters?.fulfillment && {
            estimatedFulfillment: filters.fulfillment,
          }),
          ...(filters?.customers.length && {
            clientName: filters.customers,
          }),
        },
      },
    })
    .then(response => {
      return response.data
    })

export const processPreorder = (
  orderId: string,
  items: Array<{ skuId: number; quantity: number }>
): Promise<GetPreordersResponse> =>
  axios
    .post('/poa/pre-orders/fulfill', { orderId, items })
    .then(response => {
      return response.data
    })
    .catch(e => {
      throw new Error(e)
    })

export const cancelPreorder = (
  orderId: string,
  items: Array<{ skuId: number; quantity: number }>
): Promise<GetPreordersResponse> =>
  axios.post('/poa/pre-orders/cancel', { orderId, items }).then(response => {
    return response.data
  })

export const getPreordersTotals = (): Promise<PreordersTotals> =>
  axios.get('/poa/pre-orders/totals', {}).then(response => {
    return response.data
  })

export const getPreorderFilters = (): Promise<string[]> =>
  axios
    .get('/poa/pre-orders/filters', {})
    .then(response => {
      return response.data
    })
    .catch(e => {
      throw e
    })

export const getSellerPercentage = (): Promise<{ [p: string]: number }> =>
  axios.get('/poa/token/sellers-percentage', {}).then(response => {
    return response.data
  })

export const setSellerPercentage = (percent: number): Promise<any> =>
  axios.post('/poa/token/seller-percentage', { percent }).then(response => {
    return response.data
  })

export const notifyUserMail = (
  orderId: string,
  items: Array<{ ImageUrl: string; SkuName: string }>
): Promise<any> =>
  axios.post('/poa/token/user-notify', { orderId, items }).then(response => {
    return response.data
  })
