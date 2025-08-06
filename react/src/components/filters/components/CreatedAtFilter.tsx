import React from 'react'
import { RadioGroup } from 'vtex.styleguide'

import type { IFilterProps } from '../../../types/common'
import { FILTER_CREATED_AT } from '../../../constants/order'


function CreatedAtFilter({ value, onChange }: IFilterProps) {

  return (
      <RadioGroup
        hideBorder
        name="paymentMethods"
        options={FILTER_CREATED_AT}
        value={value}
        onChange={(e:any) => {
          onChange(e.currentTarget.value)
        }}
      />
  )
}

export default CreatedAtFilter
