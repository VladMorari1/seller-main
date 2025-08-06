import { InstanceOptions, IOContext } from '@vtex/api'

import MongoClient from '../core/mongo.client'
import { VTEXContext } from '../types'
import { SellersPercent } from '../types/payment'
import { getMongoCredentials } from '../utils'

export default class SellerPercentageClient extends MongoClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`/token`, ctx, options)
  }

  public async getSellersPercent(
    context: VTEXContext,
    data: { sellerIds: string[] }
  ): Promise<SellersPercent> {
    const mongoCredentials = await getMongoCredentials(context)
    const res= await this.http.post<SellersPercent>('/get-sellers-percent', data, {
      auth: mongoCredentials,
    }).catch((e)=>{
      console.log('ERROR-',e);
      return null
    })

    // @ts-ignore
    return res
  }

  public async setSellersPercent(
    context: VTEXContext,
    data: { sellerId: string; percent: number }
  ): Promise<SellersPercent> {
    const mongoCredentials = await getMongoCredentials(context)
    return this.http.post<SellersPercent>('/seller-percent', data, {
      auth: mongoCredentials,
    })
  }
}
