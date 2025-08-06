import type {
  EstimatedFulfillment,
  PreOrderDto,
  PreOrderItem,
} from '../../types'

type AugmentedPreOrderDto = PreOrderDto & {
  itemsEta?: EstimatedFulfillment
  status: string
}

export function estimatedFulfillmentFromISODate(
  date: string | undefined
): EstimatedFulfillment | undefined {
  if (!date) {
    return undefined
  }

  const parsedDate = new Date(date)
  const year = parsedDate.getFullYear()
  const month = parsedDate.getMonth() as EstimatedFulfillment['month']
  let partOfMonth: EstimatedFulfillment['partOfMonth'] = 'mid'

  if (parsedDate.getDate() < 10) {
    partOfMonth = 'start'
  }

  if (parsedDate.getDate() > 20) {
    partOfMonth = 'end'
  }

  return {
    year,
    month,
    partOfMonth,
  }
}

export function augmentedPreOrderDto(
  preOrder: PreOrderDto
): AugmentedPreOrderDto {
  const latestItemFulfillment = estimatedFulfillmentFromISODate(
    preOrder.latestItemFulfillment as string
  )

  const items: PreOrderItem[] = preOrder.items.map(item => ({
    ...item,
    soonestFulfillment: estimatedFulfillmentFromISODate(
      item.soonestFulfillment as string
    ),
  }))

  return {
    ...preOrder,
    items,
    latestItemFulfillment,
  }
}
