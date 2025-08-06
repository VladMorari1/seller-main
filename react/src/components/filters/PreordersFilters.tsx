import type { Dispatch, SetStateAction } from 'react'
import React, { useEffect, useState } from 'react'
import { FilterBar } from 'vtex.styleguide'

import CustomerNameFilter from './components/CustomerNameFilter'
import type {
  IGlobalStatement,
  WarehousesObjectFilter,
  IFilterProps,
} from '../../types/common'
import EstimatedFulfillmentFilter from './components/EstimatedFulfillmentFilter'
import { getPreorderFilters } from '../../services/preorders'
import type { PreordersFiltersProps } from '../../types/preordersTypes'
import { convertToObjectFulfilment } from '../../utils/date.utils'

function PreordersFilters({
  setPreorderFilters,
}: {
  setPreorderFilters: Dispatch<SetStateAction<PreordersFiltersProps>>
}) {
  const [statements, setStatements] = useState<IGlobalStatement[]>([])
  const [customerList, setCustomerList] = useState<string[]>([])
  const emptyFilters = {
    customers: [],
    fulfillment: null,
  }

  useEffect(() => {
    getPreorderFilters().then(res => {
      setCustomerList(res)
    })
  }, [])

  const handleFiltersChange = (filterStatements: IGlobalStatement[]) => {
    const statementToObject: any = filterStatements.reduce((acc, curr) => {
      return { ...acc, [curr.verb]: curr }
    }, {})

    if (!Object.keys(statementToObject).length) {
      setPreorderFilters(emptyFilters)

      return setStatements([])
    }

    setPreorderFilters(prev => ({
      ...prev,
      customers: Object.values(statementToObject?.customers?.object || {})
        .filter(_curr => (_curr as WarehousesObjectFilter).checked)
        ?.map(value => (value as { id: string }).id),
      fulfillment: statementToObject?.fulfillment?.object
        ? convertToObjectFulfilment(statementToObject.fulfillment.object)
        : null,
    }))
    setStatements(filterStatements)
  }

  return (
    <div>
      <FilterBar
        alwaysVisibleFilters={['customers', 'fulfillment']}
        statements={statements}
        onChangeStatements={handleFiltersChange}
        clearAllFiltersButtonLabel="Clear"
        options={{
          customers: {
            label: 'Customers',
            renderFilterLabel: (statement: IGlobalStatement) => {
              if (!statement || !statement.object) {
                return 'All'
              }

              return 'List'
            },
            verbs: [
              {
                value: 'customers',
                object: (props: any) => (
                  <CustomerNameFilter
                    {...{
                      ...props,
                      customers: customerList ?? [],
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
        }}
      />
    </div>
  )
}

export default PreordersFilters
