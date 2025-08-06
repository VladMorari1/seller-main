import React, { useEffect, useState } from 'react'
import {
  InputSearch,
  PageBlock,
  Totalizer,
  InputButton,
  Alert,
} from 'vtex.styleguide'

import PreordersFilters from '../../components/filters/PreordersFilters'
import PreordersTable from '../../components/PreordersTable'
import {
  getPreordersTotals,
  getSellerPercentage,
  setSellerPercentage,
} from '../../services/preorders'
import type {
  PreordersTotals,
  PreordersFiltersProps,
} from '../../types/preordersTypes'
import { useDebounce } from '../../hooks/useDebounce'

function PreordersPage() {
  const [searchValue, setSearchValue] = useState<string>('')
  const [sellerPercent, setSellerPercent] = useState(0)
  const [notificationMessage, setNotificationMessage] = useState({
    text: '',
    type: 'success',
  })

  const [preordersTotals, setPreordersTotals] = useState<PreordersTotals>({
    totalValue: 0,
    totalCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
    completedCount: 0,
  })

  const [preorderFilters, setPreorderFilters] = useState<PreordersFiltersProps>(
    {
      customers: [],
      fulfillment: null,
    }
  )

  const debouncedSearchTerm = useDebounce(searchValue, 500)

  useEffect(() => {
    getPreordersTotals().then(res => {
      setPreordersTotals(res)
    })
    getSellerPercentage().then(res => {
      const percent = Object.values(res)

      if (percent.length) {
        setSellerPercent(percent[0])
      }
    })
  }, [])

  const saveNewPercent = () => {
    if (sellerPercent) {
      setSellerPercentage(sellerPercent)
    }
  }

  return (
    <div className="bg-muted-5 mt3">
      {notificationMessage.text && (
        <div className="shadow-1-l fixed z-9999 bottom-2-l right-1">
          <Alert
            autoClose={4000}
            type={notificationMessage.type}
            onClose={() => setNotificationMessage({ text: '', type: '' })}
          >
            {notificationMessage.text}
          </Alert>
        </div>
      )}
      <PageBlock variation="full">
        <PreordersFilters setPreorderFilters={setPreorderFilters} />
        <Totalizer
          items={[
            {
              label: 'Total preorders:',
              value: preordersTotals.totalCount,
            },
            {
              label: 'Not processed preorders:',
              value: preordersTotals.pendingCount,
            },
            {
              label: 'Processed preorders:',
              value: preordersTotals.completedCount,
            },
            {
              label: 'Canceled preorders:',
              value: preordersTotals.cancelledCount,
            },
            {
              label: 'Total preorders value:',
              value: `${(preordersTotals.totalValue / 100).toFixed(2)} $`,
            },
          ]}
        />
        <div className="mt3">
          <InputSearch
            placeholder="Search by Order ID or SKU ID"
            value={searchValue}
            size="small"
            onChange={(e: { target: { value: string } }) =>
              setSearchValue(e.target.value)
            }
          />
        </div>
        <div className="mb3 mt3">
          <form
            onSubmit={e => {
              e.preventDefault()
              saveNewPercent()
            }}
          >
            <InputButton
              placeholder="%"
              size="regular"
              label="Set your preorder percentage (%)"
              button="Save"
              value={sellerPercent}
              onChange={(e: { target: { value: string } }) => {
                const val = Number.isNaN(Number(e.target.value))
                  ? 0
                  : Number(e.target.value)

                setSellerPercent(val)
              }}
            />
          </form>
        </div>
        <div>
          <PreordersTable
            searchedVal={debouncedSearchTerm}
            preorderFilters={preorderFilters}
            setNotificationMessage={setNotificationMessage}
          />
        </div>
      </PageBlock>
    </div>
  )
}

export default PreordersPage
