import React, { useEffect, useState } from 'react'
import { CheckboxGroup } from 'vtex.styleguide'

import type { ICustomersFilterProps } from '../../../types/common'

function CustomerNameFilter({ onChange, customers }: ICustomersFilterProps) {
  const [checkedMap, setCheckedMap] = useState<
    Array<{ label: string; checked: boolean; id: string }>
  >([])

  useEffect(() => {
    if (customers.length) {
      const customersMap = customers.map(el => {
        return { label: el, checked: false, id: el }
      })

      setCheckedMap(customersMap)
    }
  }, [customers])

  return (
    <div
      style={{
        height: '200px',
        overflowY: 'scroll',
      }}
    >
      <CheckboxGroup
        padded={false}
        name="customers"
        label="All customers"
        id="customer"
        checkedMap={checkedMap}
        onGroupChange={(newCheckedMap: any) => {
          onChange(newCheckedMap)
          setCheckedMap(newCheckedMap)
        }}
      />
    </div>
  )
}

export default CustomerNameFilter
