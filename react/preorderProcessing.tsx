import React, { useState } from 'react'
import type { FC } from 'react'
import { Layout, PageHeader, Tabs, Tab } from 'vtex.styleguide'

import PreordersPage from './src/pages/Preorders'
import Sku from './src/pages/Sku'
import { SellerTabs } from './src/types/common'
import TransfersDetails from './src/components/TransfersDetails'
import OrdersPage from './src/pages/Orders'
import { OrdersFiltersProps } from './src/types/ordersTypes'

const PreorderProcessing: FC = () => {
  const [selectedTab, setSelectedTab] = useState(SellerTabs.ORDERS)

  const [orderSearchValue, setOrderSearchValue] = useState<string>('')

  const [orderFilters, setOrderFilters] = useState<OrdersFiltersProps>(
    {
      createdAt: undefined,
    }
  )


  return (
    <>
      <Layout
        fullWidth
        pageHeader={<PageHeader title="Pre-orders Dashboard" />}
      >
        <Tabs>
          <Tab
            label="All Orders"
            active={selectedTab === SellerTabs.ORDERS}
            onClick={() => setSelectedTab(SellerTabs.ORDERS)}
          >
            <OrdersPage orderFilters={orderFilters} setOrderFilters={setOrderFilters} searchValue={orderSearchValue} setSearchValue={setOrderSearchValue} />
          </Tab>
          <Tab
            label="Pre-orders"
            active={selectedTab === SellerTabs.PREORDERS}
            onClick={() => setSelectedTab(SellerTabs.PREORDERS)}
          >
            <PreordersPage />
          </Tab>
          <Tab
            label="SKUs"
            active={selectedTab === SellerTabs.SKU}
            onClick={() => setSelectedTab(SellerTabs.SKU)}
          >
            <Sku />
          </Tab>
          <Tab
            label="Transfers"
            active={selectedTab === SellerTabs.TRANSFERS}
            onClick={() => setSelectedTab(SellerTabs.TRANSFERS)}
          >
            <TransfersDetails />
          </Tab>
        </Tabs>
      </Layout>
    </>
  )
}

export default PreorderProcessing
