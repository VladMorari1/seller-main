import type { PreorderItemsEta } from './common'

export type EstimatedFulfillment = {
  month: number
  year: number
  partOfMonth: 'start' | 'mid' | 'end'
}

export type Warehouse = {
  id: string
  name: string
  estimatedFulfillment: EstimatedFulfillment | null
  availableStock: number
  currentStock: number
  futureStock: number // count
  fulfill: boolean
  updatedAt: null | string
}

export type Sku = {
  totals: { currentStock: number; futureStock: number; reservedStock: number }
  total: number
  id: number
  imageUrl?: string
  isAvailableForPreOrder: boolean
  skuName: string
  price: number
  warehouseIds: { [key: string]: Warehouse }
  productName: string
}

export type UpdateSku = {
  currentStock: number
  estimatedFulfillment: EstimatedFulfillment | null
  futureStock: number
  skuId: number
  warehouseId: string
}

export type AvailablePreorderData = {
  skuId: number
  isAvailableForPreOrder: boolean
}

export type SKUFilters = {
  warehouses: Warehouse[]
}

export type SKUFiltersProps = {
  warehouses: string[]
  fulfillment: null | PreorderItemsEta
  isAvailableForPreorder: null | boolean
}
