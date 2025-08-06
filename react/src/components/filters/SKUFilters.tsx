import React, { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { FilterBar } from 'vtex.styleguide'

import type {
  IFilterProps,
  IGlobalStatement,
  WarehousesObjectFilter,
} from '../../types/common'
import EstimatedFulfillmentFilter from './components/EstimatedFulfillmentFilter'
import AvailableForPreorderFilter from './components/AvailableForPreorderFilter'
import { getSKUFilters } from '../../services/sku'
import type { SKUFiltersProps, Warehouse } from '../../types/skuTypes'
import WarehousesFilter from './components/WarehousesFilter'
import { convertToObjectFulfilment } from '../../utils/date.utils'

function SKUFilters({
  setSkuFilters,
}: {
  setSkuFilters: Dispatch<SetStateAction<SKUFiltersProps>>
}) {
  const [statements, setStatements] = useState<IGlobalStatement[]>([])
  const [warehouseList, setWarehouseList] = useState<Warehouse[]>()
  const emptyFilters = {
    warehouses: [],
    fulfillment: null,
    isAvailableForPreorder: null,
  }

  useEffect(() => {
    getSKUFilters().then(res => {
      if (res.warehouses) {
        setWarehouseList(res.warehouses)
      }
    })
  }, [])

  const handleFiltersChange = (filterStatements: IGlobalStatement[]) => {
    const statementToObject: any = filterStatements.reduce((acc, curr) => {
      return { ...acc, [curr.verb]: curr }
    }, {})

    if (!Object.keys(statementToObject).length) {
      setSkuFilters(emptyFilters)

      return setStatements([])
    }

    const stringToBoolean = (val: string) => {
      switch (val) {
        case 'yes':
          return true

        case 'no':
          return false

        default:
          return null
      }
    }

    setSkuFilters(prev => ({
      ...prev,
      warehouses: Object.values(statementToObject?.warehouses?.object || {})
        .filter(_curr => (_curr as WarehousesObjectFilter).checked)
        ?.map(value => (value as { id: string }).id),
      fulfillment: statementToObject?.fulfillment?.object
        ? convertToObjectFulfilment(statementToObject.fulfillment.object)
        : null,
      isAvailableForPreorder: stringToBoolean(
        statementToObject?.available?.object
      ),
    }))

    setStatements(filterStatements)
  }

  return (
    <div className="flex mb2">
      <FilterBar
        alwaysVisibleFilters={['fulfillment', 'available', 'warehouseId']}
        statements={statements}
        onChangeStatements={handleFiltersChange}
        clearAllFiltersButtonLabel="Clear"
        options={{
          warehouseId: {
            label: 'Warehouse Id',
            renderFilterLabel: (statement: IGlobalStatement) => {
              if (!statement || !statement.object) {
                return 'All'
              }

              return ' List'
            },
            verbs: [
              {
                value: 'warehouses',
                object: (props: IFilterProps) => (
                  <WarehousesFilter
                    {...{
                      ...props,
                      warehouseList: warehouseList ?? [],
                    }}
                  />
                ),
              },
            ],
          },

          fulfillment: {
            label: 'Estimated fulfillment',
            renderFilterLabel: (statement: IGlobalStatement) => {
              if (!statement || !statement.object) {
                return 'All'
              }

              return statement.object
            },
            verbs: [
              {
                value: 'fulfillment',
                object: (props: IFilterProps) => (
                  <EstimatedFulfillmentFilter {...props} />
                ),
              },
            ],
          },
          available: {
            label: 'Available for preorder',
            renderFilterLabel: (statement: IGlobalStatement) => {
              if (!statement || !statement.object) {
                return 'All'
              }

              return statement.object
            },
            verbs: [
              {
                value: 'available',
                object: (props: IFilterProps) => (
                  <AvailableForPreorderFilter {...props} />
                ),
              },
            ],
          },
        }}
      />
    </div>
  )
}

export default SKUFilters
