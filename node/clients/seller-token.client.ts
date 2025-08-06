import { InstanceOptions, IOContext } from '@vtex/api'

import MongoClient from '../core/mongo.client'
import { VTEXContext } from '../types'

export default class SellerTokenClient extends MongoClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`/token`, ctx, options)
  }

  public async addStripeAccount(
    context: VTEXContext,
    data: {
      sellerId: string
      sellerStripeAccount: string
    }
  ) {
    return this.http.post<''>(
      '/stripe-account',
      { ...data },
      await this.buildRequestConfig(context)
    )
  }
}
