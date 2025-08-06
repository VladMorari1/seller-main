import type {
  PreorderItem,
  NormalizedPreorderItem,
  Preorder,
} from '../types/preordersTypes'

export const getCanceledItems = (items: PreorderItem[]) => {
  return items.filter(i => i.cancelledAt)?.length || 0
}

export const getShippedItems = (items: PreorderItem[]) => {
  return items.filter(i => i.fulfilledAt)?.length || 0
}

export const getCheckboxProductsStructure = (
  productList: PreorderItem[]
): { [key: string]: NormalizedPreorderItem } => {
  return productList.reduce((acc: any, curr) => {
    const existingProduct = acc[curr.skuId] || {}
    const total = existingProduct.total
      ? Number(existingProduct.total || 0) + 1
      : 1

    const canceled = curr.cancelledAt
      ? Number(existingProduct.canceled || 0) + 1
      : Number(existingProduct.canceled || 0)

    const processed = curr.fulfilledAt
      ? Number(existingProduct.processed || 0) + 1
      : Number(existingProduct.processed || 0)

    return {
      ...acc,
      [curr.skuId]: {
        ...curr,
        total,
        canceled,
        processed,
      },
    }
  }, {})
}

export const areItemsChecked = (checkedMap: {
  [key: string]: { checked: boolean }
}) => {
  return Object.values(checkedMap).find(product => product.checked)
}

export const isPreorderReadyForShipment = (preorder: Preorder): Preorder => {
  const canceledItems = preorder.items.filter(e => e.cancelledAt).length

  const processedItems = preorder.items.filter(e => e.fulfilledAt).length

  if (!canceledItems && !processedItems) {
    return { ...preorder, status: 'handling' }
  }

  if (canceledItems === preorder.items.length) {
    return { ...preorder, status: 'canceled' }
  }

  if (canceledItems + processedItems === preorder.items.length) {
    return { ...preorder, status: 'shipped' }
  }

  const hasCurrentStock = preorder.items.find(e => e.currentStock)

  if (hasCurrentStock) {
    return { ...preorder, status: 'ready_for_shipment' }
  }

  return preorder
}
