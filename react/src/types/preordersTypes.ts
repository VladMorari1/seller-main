import type { PreorderItemsEta } from './common'

export interface FormattedOrderStatus {
  bgColor: string
  longText: string
  shortText?: string
}

export type GetPreordersResponse = {
  count: number
  data: Preorder[]
  page: number
  pageCount: number
  total: number
}

export interface PreorderItem {
  cancelledAt: string | null
  fulfilledAt: string | null
  name: string
  orderItemId: string
  skuId: number
  imageUrl?: string
  currentStock?: number
}

export interface NormalizedPreorderItem extends PreorderItem {
  total: number
  canceled: number
  processed: number
  soonestFulfillment?: PreorderItemsEta
}

export type Preorder = {
  client?: {
    email: string | null
    corporateName: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
  }
  createdAt: string
  items: PreorderItem[]
  latestItemFulfillment: PreorderItemsEta
  orderId: string
  status: string
  value: number
}

export type PreordersTotals = {
  totalCount: number
  pendingCount: number
  cancelledCount: number
  totalValue: number
  completedCount: number
}

export type PreordersFiltersProps = {
  customers: string[]
  fulfillment: null | PreorderItemsEta
}
