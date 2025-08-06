import React, { useEffect, useState } from 'react'
import { CheckboxGroup } from 'vtex.styleguide'

import type { IWarehouseFilterProps } from '../../../types/common'

function WarehousesFilter({ onChange, warehouseList }: IWarehouseFilterProps) {
  const [checkedMap, setCheckedMap] = useState<
    Array<{ label: string; checked: boolean; id: string }>
  >([])

  useEffect(() => {
    if (warehouseList.length) {
      const warehousesMap = warehouseList.map(el => {
        return { label: el.name, checked: false, id: el.id }
      })

      setCheckedMap(warehousesMap)
    }
  }, [warehouseList])

  return (
    <div
      style={{
        height: '200px',
        overflowY: 'scroll',
      }}
    >
      <CheckboxGroup
        padded={false}
        name="warehouses"
        label="All warehouses"
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

export default WarehousesFilter
