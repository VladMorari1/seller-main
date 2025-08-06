import type { ServiceContext } from '@vtex/api'
import type { SearchProduct } from '@vtex/clients'
import { json } from 'co-body'

import type {
  Clients,
  EstimatedFulfillment,
  FulfillStockRequestDto,
  GetSkuDto,
  SkuWaresDetailsResponseDto,
  UpdateSkuPreOrderRequestDto,
  UpdateSkuWaresCountRequestDto,
} from '../../types'
import {
  estimatedFulfillmentToDate,
  getDetailedSku,
  getSkuData,
} from './skus.helper'

export async function getSkus(
  context: ServiceContext<Clients>
): Promise<Record<string, SkuWaresDetailsResponseDto>> {
  const skus = <number[]>[]

  const body: GetSkuDto = await json(context.req)

  const { page = 1, pageSize = 10 } = body?.paging ?? {}
  const hasFiltersApplied = Object.keys(body?.filters ?? {}).length !== 0
  const searchedSkus = body?.query?.trim() ?? ''

  if (hasFiltersApplied) {
    const limit = pageSize
    const offset = (page - 1) * pageSize

    const skusMatchingFilters = await context.clients.skuWaresApi.findSkusMatchingFilters(
      context,
      body.filters,
      limit,
      offset
    )

    skus.push(...skusMatchingFilters.data)
  } else if (searchedSkus) {
    const uniqueSkus = <number[]>[]

    const skuIdsFromProductSearch = await searchProducts(
      context,
      searchedSkus,
      page,
      pageSize
    )
    uniqueSkus.push(...skuIdsFromProductSearch)

    if (Array.isArray(searchedSkus)) {
      const numberTransformedSkus = searchedSkus
        .map(Number)
        .filter(Number.isFinite)

      uniqueSkus.push(...numberTransformedSkus)
    } else {
      uniqueSkus.push(Number(searchedSkus))
    }

    skus.push(...new Set(uniqueSkus.filter(Number.isFinite)))
  } else {
    const pagedSkus = await context.clients.logisticsApi.listAllSkuIds(
      page,
      pageSize
    )

    skus.push(...pagedSkus)
  }

  const skuData = await getSkuData(context, skus)

  return skuData
}

export async function updateSkuCount(
  context: ServiceContext<Clients>
): Promise<SkuWaresDetailsResponseDto> {
  const body: UpdateSkuWaresCountRequestDto = await json(context.req)
  const estimatedFulfillmentAsDate = estimatedFulfillmentToDate(
    body.estimatedFulfillment as EstimatedFulfillment
  )
  const updatedWaresResponse = await context.clients.skuWaresApi.updateWaresCountBySku(
    context,
    {
      ...body,
      estimatedFulfillment: estimatedFulfillmentAsDate,
    }
  )

  await context.clients.logisticsApi.setUnlimitedInventoryBySku(
    body.skuId,
    body.warehouseId,
    {
      quantity: body.currentStock,
    }
  )

  return getDetailedSku(context, updatedWaresResponse)
}

export async function updateSkuPreOrderAvailable(
  context: ServiceContext<Clients>
): Promise<SkuWaresDetailsResponseDto> {
  const body: UpdateSkuPreOrderRequestDto = await json(context.req)
  const updatedWaresResponse = await context.clients.skuWaresApi.updateWaresPreOrderAvailableBySku(
    context,
    body
  )

  const skuWarehouses = await context.clients.logisticsApi.listInventoryBySku(
    body.skuId
  )

  await Promise.all(
    skuWarehouses.balance.map(({ warehouseId }) =>
      context.clients.logisticsApi.setUnlimitedInventoryBySku(
        body.skuId,
        warehouseId,
        {
          unlimitedQuantity: body.isAvailableForPreOrder,
        }
      )
    )
  )

  return getDetailedSku(context, updatedWaresResponse)
}

async function searchProducts(
  context: ServiceContext<Clients>,
  searchQuery: string | string[],
  page: number,
  pageSize: number
): Promise<number[]> {
  const searchNames = <string[]>[]

  if (Array.isArray(searchQuery)) {
    searchNames.push(...searchQuery)
  } else {
    searchNames.push(searchQuery)
  }

  const products = await context.clients.logisticsApi.searchProducts(
    searchNames.join('+'),
    page,
    pageSize
  )

  const productItems = (<SearchProduct['items']>[]).concat(
    ...products.map(({ items }) => items)
  )

  const productSkus = (<number[]>[]).concat(
    ...productItems.map(({ itemId }) => Number(itemId))
  )

  return productSkus
}

export async function getSkuFilters(context: ServiceContext<Clients>) {
  const warehouseList = await context.clients.logisticsApi.listWarehouses()

  const warehouses = warehouseList.map(({ id, name }) => ({
    id,
    name,
  }))

  return {
    warehouses,
  }
}

export function getSkuTotals(context: ServiceContext<Clients>) {
  return context.clients.skuWaresApi.getTotals(context)
}

export async function fulfillStock(context: ServiceContext<Clients>) {
  const { skuId, warehouseId }: FulfillStockRequestDto = await json(context.req)

  const updatedSku = await context.clients.skuWaresApi.fulfillStock(
    context,
    skuId,
    warehouseId
  )

  const stockInWarehouse = updatedSku.stocks.find(
    stock => stock.warehouseId === warehouseId
  )!

  await context.clients.logisticsApi.setUnlimitedInventoryBySku(
    updatedSku.skuId,
    stockInWarehouse.warehouseId,
    {
      quantity: stockInWarehouse.currentStock,
    }
  )

  return updatedSku
}
