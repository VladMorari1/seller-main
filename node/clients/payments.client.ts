import { InstanceOptions, IOContext } from '@vtex/api'

import MongoClient from '../core/mongo.client'
import { PagedResponse, VTEXContext } from '../types'
import { DbProduct, PaymentData, SellersCharge } from '../types/payment'

export default class PaymentsClient extends MongoClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`/payment-intent`, ctx, options)
  }

  public async getPaymentIntentByOrderId(
    context: VTEXContext,
    orderId: string
  ): Promise<any> {
    return this.http.get<{ sellerId: string; transferId: string }>(
      `?orderId=${orderId}`,
      await this.buildRequestConfig(context)
    )
  }

  public async getSellerStripeTransferId(
    context: VTEXContext,
    sellerId: string,
    orderId: string
  ): Promise<{ sellerId: string; transferId: string }> {
    return this.http.get<{ sellerId: string; transferId: string }>(
      `/transfer-id?sellerId=${sellerId}&orderId=${orderId}`,
      await this.buildRequestConfig(context)
    )
  }

  public async saveSellerStripeTransferId(
    context: VTEXContext,
    data: {
      orderId: string
      sellerId: string
      transferId: string
    }
  ): Promise<PaymentData> {
    return this.http.post<PaymentData>(
      '/transfer-id',
      data,
      await this.buildRequestConfig(context)
    )
  }

  public async updateMongoOrder(
    context: VTEXContext,
    data: {
      orderId: string
      updatedProducts: DbProduct[]
      updatedOrderPaidAmount: number
      sellersCharge: SellersCharge[]
    }
  ): Promise<PaymentData> {
    return this.http.patch<PaymentData>(
      '',
      data,
      await this.buildRequestConfig(context)
    )
  }

  public async listPaymentIntents(
    context: VTEXContext,
    limit: number,
    offset: number,
    searchParams: any
  ): Promise<PagedResponse<any> | any> {
    return this.http.post<PagedResponse<any>>(
      `/filtered`,
      { limit, offset, searchParams },
      await this.buildRequestConfig(context)
    )
  }
}
