import React, { useState } from 'react'
import OrdersTable from '../../components/OrdersTable'
import { InputSearch, PageBlock, ToastProvider } from 'vtex.styleguide'
import OrderDetailsModal from '../../components/modals/OrderDetailsModal'
import AllOrdersFilter from '../../components/filters/AllOrdersFilters'
import { useDebounce } from '../../hooks/useDebounce'

type Props = {
  searchValue: any,
  orderFilters: any,
  setSearchValue: any,
  setOrderFilters: any,
}

const OrdersPage = ({ searchValue, orderFilters, setSearchValue, setOrderFilters }: Props) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(undefined)

  const debouncedSearchTerm = useDebounce(searchValue, 500)

  return (
    <ToastProvider positioning="window">
      <div className="bg-muted-5 mt3">
        <OrderDetailsModal selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
        <PageBlock variation="full">
          <div className="fl mt2 mr3" style={{minWidth: '300px'}}>
            <InputSearch
              placeholder="Search by Order ID"
              value={searchValue}
              size="small"
              onChange={(e: { target: { value: string } }) =>
                setSearchValue(e.target.value)
              }
            />
          </div>
          <div className='fl'>
            <AllOrdersFilter orderFilters={orderFilters} setFilters={setOrderFilters} />
          </div>
          <OrdersTable
              searchedVal={debouncedSearchTerm}
              setSelectedOrder={setSelectedOrder}
              orderFilters={orderFilters} />
        </PageBlock>
      </div>
    </ToastProvider>
  )
}

export default OrdersPage
