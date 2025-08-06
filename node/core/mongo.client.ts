import { ExternalClient, RequestConfig } from '@vtex/api'
import type { InstanceOptions, IOContext } from '@vtex/api'

import { getMongoCredentials } from '../utils'
import { VTEXContext } from '../types'

export default class MongoClient extends ExternalClient {
  constructor(basePath: string, ctx: IOContext, options?: InstanceOptions) {
    super(
      `http://ec2-13-211-128-127.ap-southeast-2.compute.amazonaws.com/${basePath}`,
      ctx,
      {
        ...options,
        headers: {
          ...options?.headers,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // 'X-Vtex-Use-Https': 'true',
        },
      }
    )
  }

  protected async buildRequestConfig(
    context: VTEXContext,
    config?: RequestConfig
  ): Promise<RequestConfig> {
    const mongoCredentials = await getMongoCredentials(context)

    return {
      ...config,
      auth: mongoCredentials,
    }
  }
}
