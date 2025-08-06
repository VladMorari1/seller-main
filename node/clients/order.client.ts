import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class OrderClient extends ExternalClient {


  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.account}.vtexcommercestable.com.br/api/oms/pvt/orders/`,
      context,
      {
        ...options,
        headers: {
          ...options?.headers,
          VtexIdclientAutCookie: context.authToken,
        },
      }
    )
  }


  public async getOrder(orderId: any) {
    return this.http.get(`${orderId}`)
  }
}
