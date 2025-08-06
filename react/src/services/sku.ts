import axios from 'axios'

import type {
  Sku,
  UpdateSku,
  AvailablePreorderData,
  SKUFilters,
  SKUFiltersProps,
} from '../types/skuTypes'

export const getSkus = ({
  page,
  pageSize,
  filters,
  query,
}: {
  pageSize?: number
  query?: string
  filters?: SKUFiltersProps
  page: number
}): Promise<{ [p: number]: Sku }> =>
  axios
    .post('/poa/skus', {
      paging: {
        page,
        pageSize,
      },
      filters: {
        ...(filters?.fulfillment && {
          estimatedFulfillment: filters.fulfillment,
        }),
        ...(typeof filters?.isAvailableForPreorder === 'boolean' && {
          isAvailableForPreOrder: filters.isAvailableForPreorder,
        }),
        ...(filters?.warehouses.length && {
          warehouseId: filters.warehouses,
        }),
      },
      query,
    })
    .then(response => {
      return response.data
    })
    .catch(e => {
      throw e
    })

export const updateSku = (data: UpdateSku): Promise<Sku> =>
  axios
    .post('/poa/skus/update', data)
    .then(resp => {
      return resp.data
    })
    .catch(e => {
      throw e
    })

export const updateSkuAvailablePreorder = (data: AvailablePreorderData) => {
  axios
    .post('/poa/skus/pre-order', data)
    .then(resp => {
      return resp.data
    })
    .catch(() => {
      return null
    })
}

export const getSKUFilters = (): Promise<SKUFilters> =>
  axios
    .get('/poa/skus/filters', {})
    .then(response => {
      return response.data
    })
    .catch(e => {
      throw e
    })

export const getSKUTotalizerData = (): Promise<{ availableCount: number }> =>
  axios
    .get('/poa/skus/totals', {})
    .then(response => {
      return response.data
    })
    .catch(e => {
      throw e
    })

export const fulfillSKUStock = (data: {
  skuId: number
  warehouseId: string
}): Promise<any> =>
  axios
    .post('/poa/skus/fulfill', data)
    .then(resp => {
      return resp.data
    })
    .catch(e => {
      throw e
    })
