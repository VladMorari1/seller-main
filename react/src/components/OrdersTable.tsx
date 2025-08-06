import React, { Dispatch, useEffect, useState } from 'react'
import { IconLink, Table, IconCopy, ToastConsumer } from 'vtex.styleguide'

import { getAllOrders } from '../services/preorders'
import OrderStatus from './OrderStatus'
import OrderTag from '../utils/orderTag'
import { ButtonPlain } from 'vtex.styleguide'
import { OrdersFiltersProps } from '../types/ordersTypes'

const OrdersTable = ({
    searchedVal,
    orderFilters,
    setSelectedOrder,
  }:
  {
    searchedVal: any
    orderFilters: OrdersFiltersProps
    setSelectedOrder: Dispatch<React.SetStateAction<any>>
}) => {
  const [tableItems, setTableItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [tablePage, setTablePage] = useState({
    from: 1,
    to: 1,
    page: 1,
    total: 10,
    perPage: 10,
  })

  useEffect(() => {
    setIsLoading(true)
    getAllOrders({
      pageSize: tablePage.perPage,
      page: tablePage.page,
      query: searchedVal,
      filters: {
        ...orderFilters,
        createdAt: orderFilters.createdAt?
          new Date(new Date(new Date().setDate(new Date().getDate() - Number(orderFilters?.createdAt ?? 0))).setHours(0,0,0,0)).toISOString()
          :
          new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
      }
    })
      .then(preorders => {
        setTableItems(preorders.data)
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
    orderFilters,
    searchedVal,
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
        width: 150,
        cellRenderer: ({ rowData }: { rowData: any }): JSX.Element => {
          return <OrderStatus status={rowData.orderDetails?.status} />
        },
      },
      orderId: {
        title: 'Order ID',
        minWidth: 220,
        cellRenderer: ({
          cellData,
          rowData
        }: {
          cellData: string,
          rowData: any
        }): JSX.Element => {
          return (
            <div className="content-start">
              <ToastConsumer>
                { ({ showToast }: { showToast: any }) => (
                  <>
                    <ButtonPlain size="small" onClick={() => {
                      setSelectedOrder(rowData)
                    }}>
                      {cellData}
                    </ButtonPlain>
                    <span className='ml6'>
                      <ButtonPlain onClick={() =>{window.open(`${window.location.origin}/admin/orders/${cellData}`)}}>
                        <IconLink size={14} />
                        </ButtonPlain>
                    </span>
                    <span className='ml3'>
                      <ButtonPlain onClick={() => {
                        navigator.clipboard.writeText(cellData)
                        showToast('Copied to Clipboard')
                        }}>
                        <IconCopy size={14} />
                      </ButtonPlain>
                    </span>
                  </>
                )}
              </ToastConsumer>
            </div>
          )
        },
      },
      createdAt: {
        title: 'Created Date',
        minWidth: 180,
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return (
            <div className="content-start">
              {new Date(cellData).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true })}
            </div>
          )
        },
      },
      items: {
        title: 'Qty.',
        width: 80,
        cellRenderer: ({ cellData }: { cellData: any[] }): JSX.Element => {
          return (
            <div className="content-start">
              {cellData.length}
            </div>
          )
        },
      },
      value: {
        title: 'Total amount',
        width: 150,
        cellRenderer: ({ cellData }: { cellData: number }): JSX.Element => {
          return (
            <div className="content-start">
              {cellData / 100} AUD
            </div>
          )
        },
      },
      type: {
        title: 'Type',
        width: 150,
        cellRenderer: ({ rowData }: { rowData: any }): JSX.Element => {
          let text = 'SOH'
          const preorderItemsCount = rowData.items?.filter((d: any) => d.preorderDetails)?.length ?? 0

          if (preorderItemsCount) {
            text = preorderItemsCount === rowData.items.length? 'Pre-order' : 'Pre-order + SOH'
          }

          return (
            <div className="content-start">

              {
                text === 'SOH'?
                text
                :
                <OrderTag>
                  <span className="fw4 f7 helvetica" title={text}>
                    {text}
                  </span>
                </OrderTag>
              }

            </div>
          )
        },
      },
    },
  }

  return (
    <div className="f6 mt3">
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

export default OrdersTable
