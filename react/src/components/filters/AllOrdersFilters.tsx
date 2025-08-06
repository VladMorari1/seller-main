import type { Dispatch, SetStateAction } from 'react'
import React, { useEffect, useState } from 'react'
import { FilterBar } from 'vtex.styleguide'

import type {
  IGlobalStatement,
} from '../../types/common'
import CreatedAtFilter from './components/CreatedAtFilter'
import { FILTER_CREATED_AT } from '../../constants/order'
import { OrdersFiltersProps } from '../../types/ordersTypes'

function AllOrdersFilter({
  orderFilters,
  setFilters,
}: {
  orderFilters: any,
  setFilters: Dispatch<SetStateAction<OrdersFiltersProps>>
}) {
  useEffect(() => {
    setStatements([
      {
        error: null,
        object: orderFilters.createdAt,
        subject: 'createdAt',
        verb: 'createdAt'
      }
    ])

  }, [orderFilters])


  const [statements, setStatements] = useState<any[]>([
    {
      error: null,
      object: '0',
      subject: 'createdAt',
      verb: 'createdAt'
    }
  ])
  const emptyFilters = {}

  const handleFiltersChange = (filterStatements: IGlobalStatement[]) => {
    const statementToObject: any = filterStatements.reduce((acc, curr) => {
      return { ...acc, [curr.verb]: curr }
    }, {})

    if (!Object.keys(statementToObject).length) {
      setFilters(emptyFilters)

      return setStatements([])
    }

    setFilters(prev => ({
      ...prev,
      createdAt: statementToObject?.createdAt?.object
    }))
    setStatements(filterStatements)
  }

  return (
    <div>
      <FilterBar
        alwaysVisibleFilters={['createdAt']}
        statements={statements}
        onChangeStatements={handleFiltersChange}
        clearAllFiltersButtonLabel="Clear filters"
        options={{
          createdAt: {
            label: 'Created',
            renderFilterLabel: (statement: IGlobalStatement) => {
              if (!statement || !statement.object) {
                return 'Today'
              }

              return FILTER_CREATED_AT.find((d: any) => d.value === statement.object)?.label
            },
            verbs: [
              {
                value: 'createdAt',
                object: (props: any) => (
                  <CreatedAtFilter {...props} />
                ),
              },
            ],
          },
        }}
      />
    </div>
  )
}

export default AllOrdersFilter
