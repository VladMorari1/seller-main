import type { SetStateAction } from 'react'
import React, { useEffect, useState } from 'react'
import { Alert, Link, Table, Tooltip } from 'vtex.styleguide'
import { format } from 'date-fns'

import type {
  Preorder,
  PreorderItem,
  PreordersFiltersProps,
} from '../types/preordersTypes'
import ProductsProcessModal from './modals/ProductsProcessModal'
import CancelModal from './modals/CancelModal'
import ProcessModal from './modals/ProcessModal'
import ProductsCancelModal from './modals/ProductsCancelModal'
import { getPreorders } from '../services/preorders'
import PreorderStatus from './PreorderStatus'
import { months } from '../utils/date.utils'
import type { PreorderItemsEta } from '../types/common'
import {
  getCanceledItems,
  getShippedItems,
  isPreorderReadyForShipment,
} from '../utils/array.utils'
import { AlertType } from '../types/common'
import EmailNotifyModal from './modals/EmailNotifyModal'

const PreordersTable = ({
  searchedVal,
  preorderFilters,
  setNotificationMessage,
}: {
  searchedVal: any
  preorderFilters: PreordersFiltersProps
  setNotificationMessage: React.Dispatch<
    SetStateAction<{ text: string; type: string }>
  >
}) => {
  const [tableItems, setTableItems] = useState<Preorder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshTableData, setRefreshTableData] = useState(false)
  const [selectedProductsToProcess, setSelectedProductsToProcess] = useState<{
    [orderId: string]: Array<{ skuId: number; quantity: number }>
  }>({})

  const [updateError, setUpdateError] = useState<{
    text: string
    type: AlertType
  }>({ text: '', type: AlertType.ERROR })

  const [selectedProductsToCancel, setSelectedProductsToCancel] = useState<{
    [orderId: string]: Array<{ skuId: number; quantity: number }>
  }>({})

  const [tablePage, setTablePage] = useState({
    from: 1,
    to: 1,
    page: 1,
    total: 10,
    perPage: 10,
  })

  const [idPreorderProcessModal, setIdPreorderProcessModal] = useState<
    null | string
  >(null)

  const [idPreorderCancelModal, setIdPreorderCancelModal] = useState<
    null | string
  >(null)

  useEffect(() => {
    setIsLoading(true)
    getPreorders({
      pageSize: tablePage.perPage,
      page: tablePage.page,
      query: searchedVal,
      filters: preorderFilters,
    })
      .then(preorders => {
        const changedPreordersStatuses = preorders.data.map(preorder =>
          isPreorderReadyForShipment(preorder)
        )

        setTableItems(changedPreordersStatuses)
        setTablePage({
          ...tablePage,
          total: preorders.total,
          from: (preorders.page - 1) * tablePage.perPage + 1,
          to: Math.min(preorders.page * tablePage.perPage, preorders.total),
          page: preorders.page,
        })
      })
      .finally(() => setIsLoading(false))
  }, [
    tablePage.perPage,
    tablePage.page,
    searchedVal,
    refreshTableData,
    preorderFilters,
  ])

  const handleNextClick = () => {
    setTablePage({
      ...tablePage,
      page: tablePage.page + 1,
    })
  }

  const handlePrevClick = () => {
    setTablePage({
      ...tablePage,
      page: tablePage.page - 1,
    })
  }

  const onRowsChange = (_row: unknown, value: string) => {
    setTablePage({ ...tablePage, perPage: Number(value), page: 1 })
  }

  const tableOrdersSchema = {
    properties: {
      status: {
        title: 'Status',
        width: 120,
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return <PreorderStatus status={cellData} />
        },
      },
      orderId: {
        title: 'VTEX#',
        width: 200,
        cellRenderer: ({
          cellData,
        }: {
          cellData: string
          rowData: { orderId: string }
        }): JSX.Element => {
          return (
            <div className="content-start">
              <Link
                href={`${window.location.origin}/admin/orders/${cellData}`}
                target="_blank"
              >
                {cellData}
              </Link>
            </div>
          )
        },
      },
      createdAt: {
        title: 'Order Placed',
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return (
            <div className="content-start">
              {format(new Date(cellData), 'dd MMM yyyy')}
            </div>
          )
        },
      },
      businessName: {
        title: 'Business name',
        width: 130,
        cellRenderer: ({ rowData }: { rowData: Preorder }): JSX.Element => {
          return <div>{rowData.client?.corporateName}</div>
        },
      },
      latestItemFulfillment: {
        title: 'ETA',
        width: 200,
        cellRenderer: ({
          cellData,
        }: {
          cellData: PreorderItemsEta | null
        }): JSX.Element => {
          return cellData ? (
            <div className="content-start">
              {cellData.partOfMonth} of {months[cellData.month]},{' '}
              {cellData.year}
            </div>
          ) : (
            <>Waiting for fulfillment</>
          )
        },
      },
      items: {
        title: <div className="w-100 tc">Items</div>,
        width: 100,
        cellRenderer: ({
          cellData,
        }: {
          cellData: PreorderItem[]
        }): JSX.Element => {
          return (
            <span className="f5 lh-copy w-100 tc">
              <span className="green">{getShippedItems(cellData)}</span>/
              <span className="red">{getCanceledItems(cellData)}</span>/
              <span className="black b">{cellData.length}</span>
            </span>
          )
        },
      },
      value: {
        title: 'Total cost',
        width: 100,
        cellRenderer: ({ cellData }: { cellData: number }): JSX.Element => {
          return (
            <Tooltip label="Total cost">
              <span className="center">{(cellData / 100).toFixed(2)}</span>
            </Tooltip>
          )
        },
      },
      notifications: {
        title: 'Notifications',
        width: 100,
        cellRenderer: ({ rowData }: { rowData: any }): JSX.Element => {
          return (
            <div tabIndex={0} role="button">
              <EmailNotifyModal
                productList={rowData.items}
                vendorOrderId={rowData.orderId}
                setNotificationMessage={setNotificationMessage}
              />
            </div>
          )
        },
      },
      actions: {
        title: 'Actions',
        headerRight: true,
        width: 270,
        cellRenderer: ({ rowData }: { rowData: any }): JSX.Element => {
          return (
            <div tabIndex={0} role="button" className="center w-100 ml7-l flex">
              <ProductsProcessModal
                productList={rowData.items}
                setIdPreorderModal={setIdPreorderProcessModal}
                vendorOrderId={rowData.orderId}
                setSelectedProductsToProcess={setSelectedProductsToProcess}
              />
              <ProcessModal
                vendorOrderId={rowData.orderId}
                setIdProcessModalOpen={setIdPreorderProcessModal}
                selectedIdPreorderModal={idPreorderProcessModal}
                selectedProducts={selectedProductsToProcess}
                setRefreshTableData={setRefreshTableData}
                setUpdateError={setUpdateError}
              />
              <ProductsCancelModal
                productList={rowData.items}
                vendorOrderId={rowData.orderId}
                setIdPreorderModal={setIdPreorderCancelModal}
                setSelectedProductsToCancel={setSelectedProductsToCancel}
              />
              <CancelModal
                vendorOrderId={rowData.orderId}
                setIdCancelModalOpen={setIdPreorderCancelModal}
                selectedIdPreorderModal={idPreorderCancelModal}
                selectedProductsToCancel={selectedProductsToCancel}
                setRefreshTableData={setRefreshTableData}
              />
            </div>
          )
        },
      },
    },
  }

  return (
    <div className="f6 mt3">
      {!!updateError.text && (
        <div className="shadow-1-l fixed z-5 bottom-1 right-1">
          <Alert
            autoClose={4000}
            type={updateError.type}
            onClose={() => setUpdateError({ text: '', type: AlertType.ERROR })}
          >
            {updateError.text}
          </Alert>
        </div>
      )}
      <Table
        fullWidth
        schema={tableOrdersSchema}
        items={tableItems}
        loading={isLoading}
        toolbar={{
          density: {
            alignMenu: 'right',
            buttonLabel: 'Line density',
            lowOptionLabel: 'Low',
            mediumOptionLabel: 'Medium',
            highOptionLabel: 'High',
          },
        }}
        pagination={{
          onNextClick: handleNextClick,
          onPrevClick: handlePrevClick,
          currentItemFrom: tablePage.from,
          currentItemTo: tablePage.to,
          onRowsChange,
          textShowRows: 'Rows',
          textOf: 'of',
          totalItems: tablePage.total,
          rowsOptions: [5, 10, 15, 25],
          selectedOption: tablePage.perPage,
        }}
      />
    </div>
  )
}

export default PreordersTable
