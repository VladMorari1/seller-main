import { InstanceOptions, IOContext } from '@vtex/api'

import MongoClient from '../core/mongo.client'
import {
  TransferInfo,
  TransferInfoPost,
  TransferInfoResponse,
} from '../types/payment'

export default class TransfersClient extends MongoClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`/transfer`, ctx, options)
  }

  public async saveTransferInfo(data: TransferInfoPost): Promise<TransferInfo> {
    return this.http.post<TransferInfo>('', data)
  }

  public async getTransferInfo(data: {
    sellerId: string
    limit?: number
    offset?: number
  }): Promise<TransferInfoResponse> {
    const params: any = {}
    if (data.limit) {
      params.limit = String(data.limit)
    }

    if (data.offset) {
      params.offset = String(data.offset)
    }

    return this.http.get<TransferInfoResponse>(`/${data.sellerId}`, {
      params,
    })
  }
}
