import React from 'react'
import { Table } from 'vtex.styleguide'

import OrderTag from '../../utils/orderTag'
import OrderProductCell from './OrderProductCell'
import OrderStatus from '../OrderStatus'

const OrdersTable = ({
    order,
    stripe,
    isLoading
  }:
  {
    order: any,
    stripe: any,
    isLoading: boolean,
}) => {
  const tableProductsSchema = {
    properties: {
      name: {
        title: 'Product',
        cellRenderer: ({ rowData }: { rowData: any }): JSX.Element => {
          return <OrderProductCell name={rowData.name} imageUrl={rowData.imageUrl} skuId={rowData.id} refId={rowData.refId} warehouse={rowData.preorderDetails?.reservationWarehouseId} />
        },
      },
      type: {
        title: 'Type',
        width: 100,
        cellRenderer: ({ rowData }: { rowData: any }): JSX.Element => {
          const payment = stripe?.products.find((p: any) => p.sellerId === order.sellerId && p.sellerStockKeepingUnitId === String(rowData.id))

          return (
            <div className="content-start">
              {
                rowData.preorderDetails ?
                <OrderTag>
                  <span className="fw4 f7 helvetica">
                    Pre-order
                  </span>
                </OrderTag>
                : undefined
              }
              {
                rowData.preorderDetails && payment && payment.remainingCharge === '0'?
                <div className='mt2' title={JSON.stringify(payment)}>
                  <OrderStatus status={'Paid'} />
                </div>
                : undefined
              }
            </div>
          )
        },
      },
      productPrice: {
        title: 'Price',
        width: 80,
        cellRenderer: ({ rowData }: { rowData: any }): JSX.Element => {
          return (
            <div className="content-start">
              {rowData.price / 100} AUD
            </div>
          )
        },
      },
      items: {
        title: 'Qty.',
        width: 40,
        cellRenderer: ({ rowData }: { rowData: any }): JSX.Element => {
          return (
            <div className="content-start">
              {rowData.quantity}
            </div>
          )
        },
      },
      price: {
        title: 'Total (with tax)',
        width: 110,
        headerRight: true,
        cellRenderer: ({ cellData, rowData }: { cellData: number, rowData: any }): JSX.Element => {
          let charged = 0
          const payment = stripe?.products.find((p: any) => p.sellerId === order.sellerId && p.sellerStockKeepingUnitId === String(rowData.id))
          if (payment && payment.remainingCharge !== '0') {
            charged = payment.charged
          }

          return (
            <div className="content-end w-100 tr">
              <div>{((payment?.fullPrice ?? cellData) / 100).toFixed(2)} AUD</div>
              {
                charged ?
                <div className='heavy-blue f7 mt2' style={{whiteSpace: 'initial'}}>Charged for pre-order: <div className='fw5'>{charged / 100} AUD</div></div>
                : undefined
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
        schema={tableProductsSchema}
        items={order.items}
        loading={isLoading}
        dynamicRowHeight
      />
    </div>
  )
}

export default OrdersTable
