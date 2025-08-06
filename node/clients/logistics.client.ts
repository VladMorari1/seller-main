import { ExternalClient } from '@vtex/api'
import type { InstanceOptions, IOContext } from '@vtex/api'
import type { SearchProduct } from '@vtex/clients'

import type { SkuPrice, SkuInventory, Warehouse, Reservation } from '../types'

export default class LogisticsClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://${ctx.account}.vtexcommercestable.com.br/api`, ctx, {
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

  public listInventoryBySku(skuId: number): Promise<SkuInventory> {
    return this.http.get(`/logistics/pvt/inventory/skus/${skuId}`)
  }

  public setUnlimitedInventoryBySku(
    skuId: number,
    warehouseId: string,
    updates: {
      unlimitedQuantity?: boolean
      quantity?: number
    }
  ): Promise<SkuInventory> {
    const encodedWarehouseId = encodeURIComponent(warehouseId)

    return this.http.put(
      `/logistics/pvt/inventory/skus/${skuId}/warehouses/${encodedWarehouseId}`,
      updates
    )
  }

  public listAllSkuIds(page: number, pageSize: number): Promise<number[]> {
    return this.http.get(
      `/catalog_system/pvt/sku/stockkeepingunitids?page=${page}&pagesize=${pageSize}`
    )
  }

  public getPrice(skuId: number, account: string): Promise<SkuPrice> {
    return this.http.get(
      `https://api.vtex.com/${account}/pricing/prices/${skuId}`
    )
  }

  public listWarehouses(): Promise<Warehouse[]> {
    return this.http.get<Warehouse[]>('/logistics/pvt/configuration/warehouses')
  }

  public async getReservation(
    settings: any,
    reservationId: string
  ): Promise<Reservation> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.http
      .get<Reservation>(
        `/logistics/pvt/inventory/reservations/${reservationId}`,
        {
          headers: {
            ...this.options?.headers,
            'X-VTEX-API-AppKey': settings.api__appKey,
            'X-VTEX-API-AppToken': settings.api__appToken,
          },
        }
      )
      .catch(e => console.log('e--', e))
  }

  public searchProducts(
    query: string,
    page: number,
    pageSize: number
  ): Promise<SearchProduct[]> {
    const from = pageSize * (page - 1) + 1
    const to = pageSize * page

    return this.http.get<SearchProduct[]>(
      `/catalog_system/pub/products/search?_from=${from}&_to=${to}&ft=${query}`
    )
  }
}
