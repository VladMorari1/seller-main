import React, { useState } from 'react'
import { Dropdown } from 'vtex.styleguide'

import type { IFilterProps } from '../../../types/common'

function AvailableForPreorderFilter({ onChange }: IFilterProps) {
  const [isAvailableForPreorder, setIsAvailableForPreorder] = useState('')
  const options = [
    { value: 'all', label: 'All' },
    { value: 'yes', label: 'YES' },
    { value: 'no', label: 'NO' },
  ]

  return (
    <div>
      <Dropdown
        label="Available for preorder"
        size="small"
        options={options}
        value={isAvailableForPreorder}
        onChange={(_: unknown, v: string) => {
          setIsAvailableForPreorder(v)
          onChange(v)
        }}
      />
    </div>
  )
}

export default AvailableForPreorderFilter
