export type EstimatedFulfillment = {
  month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  year: number
  partOfMonth: 'start' | 'mid' | 'end'
}

export type SkuWaresDetailsResponseDto = {
  id: number
  isAvailableForPreOrder: boolean
  totals: {
    currentStock: number
    futureStock: number
    reservedStock: number
  }
  skuName: string
  productName: string
  imageUrl?: string
  warehouseIds: Record<
    string,
    {
      id: string
      name: string
      currentStock: number
      futureStock: number
      updatedAt: string
      estimatedFulfillment?: EstimatedFulfillment | null
    }
  >
  price: number
}

export type UpdateSkuWaresCountRequestDto = {
  skuId: number
  warehouseId: string
  currentStock: number
  futureStock: number
  estimatedFulfillment: EstimatedFulfillment | Date | null
}

export type UpdateSkuPreOrderRequestDto = {
  skuId: number
  isAvailableForPreOrder: boolean
}

export type FulfillStockRequestDto = {
  skuId: number
  warehouseId: string
}

export type SkuPrice = {
  itemId: string
  listPrice: number
  costPrice: number
  markup: number
  basePrice: number
  fixedPrices: [
    {
      tradePolicyId: string
      value: number
      listPrice: number
      minQuantity: number
      dateRange: {
        from: string
        to: string
      }
    },
    {
      tradePolicyId: string
      value: number
      listPrice: number
      minQuantity: number
    }
  ]
}

export type SkuInventory = {
  skuId: string
  balance: Array<{
    warehouseId: string
    warehouseName: string
    totalQuantity: number
    reservedQuantity: number
    hasUnlimitedQuantity: boolean
  }>
}

export type WaresCountBySkuResponseDto = {
  skuId: number
  sellerId: string
  isAvailableForPreOrder: boolean
  stocks: Array<{
    currentStock: number
    futureStock: number
    updatedAt: string
    warehouseId: string
    estimatedFulfillment?:
      | string
      | {
          partOfMonth: 'start' | 'mid' | 'end'
          month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
          year: number
        }
  }>
  totals: {
    currentStock: number
    futureStock: number
    reservedStock: number
  }
}

export type Warehouse = {
  id: string
  name: string
  warehouseDocks: [
    {
      dockId: string
      time: string
      cost: number
    }
  ]
  pickupPointIds: number[]
  priority: number
  isActive: boolean
}

export type GetSkuDto = Partial<{
  filters: Partial<{
    estimatedFulfillment: {
      year: number
      month: number
      partOfMonth: string
    }
    warehouseIds: string[]
    isAvailableForPreOrder: boolean
  }>
  query: string
  paging: {
    page: number
    pageSize: number
  }
}>
