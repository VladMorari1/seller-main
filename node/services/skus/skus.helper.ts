import type { ServiceContext } from '@vtex/api'
import type { GetSkuContextResponse } from '@vtex/clients'

import type {
  Clients,
  EstimatedFulfillment,
  SkuInventory,
  SkuPrice,
  SkuWaresDetailsResponseDto,
  WaresCountBySkuResponseDto,
} from '../../types'
import {
  arrayToObjectByProperty,
  sum,
  zipPropertiesOfArrayToObject,
} from '../../utils'
import { estimatedFulfillmentFromISODate } from '../pre-orders/pre-orders.helper'

export async function getDetailedSku(
  context: ServiceContext<Clients>,
  waresDetails: WaresCountBySkuResponseDto
): Promise<SkuWaresDetailsResponseDto> {
  const { vtex: { account } } = context
  const { skuId } = waresDetails
  const skuDetails = await context.clients.catalogApi.getSkuContext(
    String(skuId)
  )
  const skuWarehouses = await context.clients.logisticsApi.listInventoryBySku(
    skuId
  )
  const skuPrice = await context.clients.logisticsApi.getPrice(skuId, account)

  return detailsToDto(
    skuId,
    waresDetails,
    skuDetails,
    skuWarehouses.balance,
    skuPrice
  )
}

export function detailsToDto(
  skuId: number,
  wareDetails: WaresCountBySkuResponseDto,
  skuDetails: GetSkuContextResponse,
  skuWarehouses: SkuInventory['balance'],
  skuPrice: SkuPrice
): SkuWaresDetailsResponseDto {
  const warehouseWaresData = arrayToObjectByProperty(
    wareDetails.stocks,
    'warehouseId'
  )

  const warehousesData = skuWarehouses.map(
    ({ warehouseId, warehouseName }) => ({
      id: warehouseId,
      name: warehouseName,
      estimatedFulfillment:
        estimatedFulfillmentFromISODate(
          warehouseWaresData[warehouseId]?.estimatedFulfillment as string
        ) ?? null,
      currentStock: warehouseWaresData[warehouseId]?.currentStock ?? 0,
      futureStock: warehouseWaresData[warehouseId]?.futureStock ?? 0,
      updatedAt: warehouseWaresData[warehouseId]?.updatedAt ?? null,
    })
  )

  const totalReservedVtex = sum(
    skuWarehouses.map(({ reservedQuantity }) => reservedQuantity)
  )

  const totals = {
    currentStock: sum(
      wareDetails.stocks.map(({ currentStock }) => currentStock)
    ),
    futureStock: sum(wareDetails.stocks.map(({ futureStock }) => futureStock)),
    reservedStock: totalReservedVtex,
  }

  return {
    id: skuId,
    isAvailableForPreOrder: wareDetails.isAvailableForPreOrder ?? false,
    totals,
    imageUrl: skuDetails.ImageUrl,
    skuName: skuDetails.SkuName,
    productName: skuDetails.ProductName,
    warehouseIds: arrayToObjectByProperty(warehousesData, 'id'),
    price: skuPrice?.costPrice,
  }
}

export async function getSkuData(
  context: ServiceContext<Clients>,
  skus: number[]
) {
  const { vtex: { account } } = context
  const [waresState, skuDetails, skuWarehouses, skuPrice] = await Promise.all([
    // Get counters for each sku from mongodb
    context.clients.skuWaresApi
      .getWaresCountBySkus(context, skus)
      .then(result => arrayToObjectByProperty(result, 'skuId')),
    // Get details for each sku (name, image)
    Promise.all(
      skus.map(id => context.clients.catalogApi.getSkuContext(String(id)))
    ).then(result => arrayToObjectByProperty(result, 'Id')),
    // Get a warehouse list for each sku
    Promise.all(
      skus.map(id => context.clients.logisticsApi.listInventoryBySku(id))
    ).then(result => zipPropertiesOfArrayToObject(result, 'skuId', 'balance')),
    // Get prices for each sku
    Promise.all(skus.map(id => context.clients.logisticsApi.getPrice(id, account)))
      .then(result => {
        return arrayToObjectByProperty(result, 'itemId')
      })
      .catch(() => {
        return {
          itemId: '-1',
          listPrice: 0,
          costPrice: 0,
          markup: 0,
          basePrice: 0,
          fixedPrices: [],
        } as any
      }),
  ])

  const augmentedProducts = skus.map(skuId => {
    return detailsToDto(
      skuId,
      waresState[skuId] ?? {
        skuId,
        isAvailableForPreOrder: false,
        stocks: [],
      },
      skuDetails[skuId],
      skuWarehouses[skuId],
      skuPrice[skuId]
    )
  })

  return arrayToObjectByProperty(augmentedProducts, 'id')
}

const PartOfMonthAsDate = {
  start: 1,
  mid: 15,
  end: 28,
}

export function estimatedFulfillmentToDate(
  estimatedFulfillment?: EstimatedFulfillment
): Date | null {
  if (!estimatedFulfillment) {
    return null
  }

  const { year, month, partOfMonth } = estimatedFulfillment

  const dateOfMonth = PartOfMonthAsDate[partOfMonth]

  return new Date(year, month, dateOfMonth)
}
