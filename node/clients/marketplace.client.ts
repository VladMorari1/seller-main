import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

import { PaymentData } from '../types/payment'

export default class MarketplaceClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    // here should be whola, beacause this request is made from seller to marketplace
    super(`http://whola.myvtex.com`, ctx, {
      ...options,
      headers: {
        ...options?.headers,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Vtex-Use-Https': 'true',
        VtexIdclientAutCookie: ctx.adminUserAuthToken ?? ctx.authToken,
      },
    })
  }

  public notifySeller(
    orderId: string,
    emailList: string[],
    seller: string
  ): Promise<any> {
    return this.http.post(`/notify`, { orderId, emailList, seller })
  }

  public notifyUser(
    orderId: string,
    items: Array<{ ImageUrl: string; SkuName: string }>
  ): Promise<any> {
    return this.http.post(`/notify-user`, { orderId, items })
  }

  public getMongoPayment(orderId: string): Promise<PaymentData | string> {
    return this.http.post(`/poa/mongo-payment`, { orderId })
  }

  public processStripePayment({
    payment_method,
    orderId,
    amount,
    currency,
    customer,
  }: {
    amount: number
    currency: string
    orderId: string
    customer?: string
    payment_method?: string
  }): Promise<{ latest_charge: string }> {
    return this.http.post(`/poa/stripe-payment`, {
      payment_method,
      orderId,
      amount,
      currency,
      customer,
    })
  }

  public paySeller({
    sellerStripeAccountId,
    description,
    currency,
    amount,
    lastChargeId,
  }: {
    sellerStripeAccountId: string
    amount: number
    description: { username: string; orderId: string }
    currency: string
    lastChargeId: string
  }): Promise<any> {
    return this.http.post(`/poa/req-seller-payment`, {
      sellerStripeAccountId,
      description,
      currency,
      amount,
      lastChargeId,
    })
  }

  public reverseSellerTransfer(
    transferId: string,
    amount: number
  ): Promise<PaymentData | string> {
    return this.http.post(`/poa/reverse-transfer`, { transferId, amount })
  }

  public refundUserMoney(
    paymentIntent: string,
    amount: number
  ): Promise<PaymentData | string> {
    return this.http.post(`/poa/refund-payment`, { paymentIntent, amount })
  }

  public getOrder(orderId: string): Promise<any> {
    return this.http.get(`/order?orderId=${orderId}`)
  }

  public getCommissions(sellerId: string): Promise<any> {
    return this.http.get(`/commissionsBySellerId?sellerId=${sellerId}`)
  }

  public getOrdersByOrderNumber(orderNumber: string): Promise<any> {
    return this.http.get(`/orders-by-order-number?orderNumber=${orderNumber}`)
  }
}
