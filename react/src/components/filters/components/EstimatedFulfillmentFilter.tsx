import React, { useState } from 'react'
import { Dropdown } from 'vtex.styleguide'

import type { IFilterProps } from '../../../types/common'
import { getFulfilmentTime } from '../../../utils/date.utils'

function EstimatedFulfillmentFilter({ onChange }: IFilterProps) {
  const estimateOptions = getFulfilmentTime().map(el => {
    return { label: el, value: el }
  })

  const [estimatedFulfillment, setEstimatedFulfillment] = useState(
    estimateOptions[0].value
  )

  return (
    <div>
      <Dropdown
        label="Estimated fulfillment"
        size="small"
        options={estimateOptions}
        value={estimatedFulfillment}
        onChange={(_: unknown, v: string) => {
          setEstimatedFulfillment(v)
          onChange(v)
        }}
      />
    </div>
  )
}

export default EstimatedFulfillmentFilter
