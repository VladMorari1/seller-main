export type DbProduct = {
  skuId: string
  fullPrice: string | number // this price is already calculated (initialPrice * quantity)
  remainingCharge: string | number
  sellerStockKeepingUnitId: string
  sellerId: string
  refunded: boolean
  charged: string | number // charged is already calculated (initialPrice * quantity)
  quantity: number
  commission: number // taxValue is per item (need to multiply with quantity to get full tax value)
  percent: number // percent of how much was paid on first charge
}
export type SellersCharge = {
  sellerId: string | number
  lastChargeId: string
  firstTransferId?: string
}
export type PaymentData = {
  shippingAmount: string
  paymentId: string
  orderId: string
  paymentDetails: {
    paymentMethodId: string
    paymentIntentId: string
    paymentIntentClientSecret: string
    currency: string
    customer: string
  }
  paidAmount: string
  products: DbProduct[]
  sellersCharge: SellersCharge[]
}

export interface OrderProducts extends DbProduct {
  itemPrice: number
  rechargeValue: number
  rechargeCommission: number
}

export type SellersPercent = {
  [sellerId: string]: number // sellerId:percent
}

export type TransferInfo = {
  transactionId: string
  orderLink: string
  sellerId: string
  orderId: string
  type: string
  amount: string
  currency: string
  description: string
  createdAt: string
}

export type TransferInfoResponse = {
  data: TransferInfo[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

export type TransferInfoPost = Omit<TransferInfo, 'createdAt'>
