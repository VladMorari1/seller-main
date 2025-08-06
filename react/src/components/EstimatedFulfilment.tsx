import React from 'react'
import { Dropdown } from 'vtex.styleguide'

import type { EstimatedFulfillment, Sku } from '../types/skuTypes'
import { getFulfilmentTime, getSkuFulfilment } from '../utils/date.utils'

function EstimatedFulfilment({
  rowData,
  fulfillment,
  changeFulfilment,
}: {
  rowData: Sku
  fulfillment: {
    [warehouseKey: string]: EstimatedFulfillment | null
  }
  changeFulfilment: (value: string, skuId: number, warehouseId: string) => void
}) {
  const estimateOptions = getFulfilmentTime().map(el => {
    return { label: el, value: el }
  })

  return (
    <div className="mb1 w-100">
      <Dropdown
        size="small"
        options={estimateOptions}
        value={fulfillment ? getSkuFulfilment(fulfillment) : null}
        onChange={(_: unknown, v: string) => {
          changeFulfilment(v, rowData.id, Object.keys(fulfillment)[0])
        }}
      />
    </div>
  )
}

export default EstimatedFulfilment
