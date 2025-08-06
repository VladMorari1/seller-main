import type { InstanceOptions, IOContext } from '@vtex/api'

import MongoClient from '../core/mongo.client'
import type {
  VTEXContext,
  WaresCountBySkuResponseDto,
  UpdateSkuWaresCountRequestDto,
  UpdateSkuPreOrderRequestDto,
  PagedResponse,
  GetSkuDto,
} from '../types'

export default class SkuWaresClient extends MongoClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`/wares`, ctx, options)
  }

  public async getWaresCountBySkus(
    context: VTEXContext,
    skuIds: number[]
  ): Promise<WaresCountBySkuResponseDto[]> {
    return this.http.post<WaresCountBySkuResponseDto[]>(
      '/count-by-sku',
      {
        skuIds,
      },
      await this.buildRequestConfig(context)
    )
  }

  public async updateWaresCountBySku(
    context: VTEXContext,
    skuUpdates: UpdateSkuWaresCountRequestDto
  ): Promise<WaresCountBySkuResponseDto> {
    return this.http.post<WaresCountBySkuResponseDto>(
      '/update-sku',
      skuUpdates,
      await this.buildRequestConfig(context)
    )
  }

  public async updateWaresPreOrderAvailableBySku(
    context: VTEXContext,
    skuUpdates: UpdateSkuPreOrderRequestDto
  ): Promise<WaresCountBySkuResponseDto> {
    return this.http.post<WaresCountBySkuResponseDto>(
      '/update-can-pre-order',
      skuUpdates,
      await this.buildRequestConfig(context)
    )
  }

  public async findSkusMatchingFilters(
    context: VTEXContext,
    filters: GetSkuDto['filters'],
    limit: number,
    offset: number
  ): Promise<PagedResponse<number>> {
    return this.http.post<PagedResponse<number>>(
      '/search',
      filters,
      await this.buildRequestConfig(context, {
        params: {
          limit,
          offset,
        },
      })
    )
  }

  public async getTotals(context: VTEXContext): Promise<void> {
    return this.http.get<void>(
      `/totals`,
      await this.buildRequestConfig(context)
    )
  }

  public async fulfillStock(
    context: VTEXContext,
    skuId: number,
    warehouseId: string
  ): Promise<WaresCountBySkuResponseDto> {
    return this.http.get<WaresCountBySkuResponseDto>(
      `${skuId}/fulfill/${warehouseId}`,
      await this.buildRequestConfig(context)
    )
  }

  public async checkProductListIsPreorders(
    context: VTEXContext,
    data: {
      products: Array<{
        skuId: string
        sellerId: string
      }>
    }
  ): Promise<Array<{ skuId: string; isPreorder: boolean }>> {
    return this.http.post<any>(
      '/is-preorder',
      data,
      await this.buildRequestConfig(context)
    )
  }
}
