import type { InstanceOptions, IOContext } from '@vtex/api'

import MongoClient from '../core/mongo.client'
import type {
  VTEXContext,
  RegisterPreOrderRequestDto,
  RegisterPreOrderResponseDto,
  FulfillPreOrderItemsRequestDto,
  GetFiltersResponseDto,
  PagedResponse,
  PreOrderDto,
  GetTotalsResponseDto,
} from '../types'

export default class PreOrdersClient extends MongoClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`/pre-order`, ctx, options)
  }

  public async listAllOrders(
    context: VTEXContext,
    limit: number,
    offset: number,
    searchParams: Record<string, unknown>
  ): Promise<PagedResponse<PreOrderDto>> {
    return this.http.post<PagedResponse<PreOrderDto>>(
      `/allfiltered`,
      { limit, offset, searchParams },
      await this.buildRequestConfig(context)
    )
  }

  public async listPreOrders(
    context: VTEXContext,
    limit: number,
    offset: number,
    searchParams: any
  ): Promise<PagedResponse<PreOrderDto> | any> {
    return this.http.post<PagedResponse<PreOrderDto>>(
      `/filtered`,
      { limit, offset, searchParams },
      await this.buildRequestConfig(context)
    )
  }

  public async checkPreorder(
    context: VTEXContext,
    body: { orderId: string; sellerId: string }
  ): Promise<boolean> {
    return this.http.post<boolean>(
      `/check-preorder`,
      body,
      await this.buildRequestConfig(context)
    )
  }

  public async checkPreorderByOrderNumber(
    context: VTEXContext,
    body: { orderId: string; sellerId: string }
  ): Promise<boolean> {
    return this.http.post<boolean>(
      `/check-preorder-by-order-number`,
      body,
      await this.buildRequestConfig(context)
    )
  }

  public async registerPreOrder(
    context: VTEXContext,
    orderData: RegisterPreOrderRequestDto
  ): Promise<RegisterPreOrderResponseDto> {
    return this.http.post<RegisterPreOrderResponseDto>(
      '/',
      orderData,
      await this.buildRequestConfig(context)
    )
  }

  public async fulfillPreOrderItems(
    context: VTEXContext,
    action: 'fulfill' | 'cancel',
    orderId: string,
    orderItems: FulfillPreOrderItemsRequestDto['items']
  ): Promise<RegisterPreOrderResponseDto> {
    return this.http.patch<RegisterPreOrderResponseDto>(
      `/${orderId}/${action}`,
      { items: orderItems },
      await this.buildRequestConfig(context)
    )
  }

  public async getTotals(context: VTEXContext): Promise<GetTotalsResponseDto> {
    return this.http.get<GetTotalsResponseDto>(
      `/totals`,
      await this.buildRequestConfig(context)
    )
  }

  public async getFilters(
    context: VTEXContext
  ): Promise<GetFiltersResponseDto> {
    return this.http.get<GetFiltersResponseDto>(
      `/filters`,
      await this.buildRequestConfig(context)
    )
  }
}
