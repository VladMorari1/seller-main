import React, { useEffect, useState } from 'react'
import { Link, Table } from 'vtex.styleguide'

import { formatDate } from '../utils/date.utils'
import { getTransfers } from '../services/transfers'

function TransfersTable() {
  const [transfers, setTransfers] = useState([])
  const [tableTotal, setTableTotal] = useState(0)
  const [tablePerPage, setTablePerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const offset = (currentPage - 1) * tablePerPage

    setIsLoading(true)
    getTransfers(tablePerPage, offset)
      .then(r => {
        setTableTotal(r.data.meta.total)
        if (r.data.data) {
          setTransfers(r.data.data)
        }
      })
      .finally(() => setIsLoading(false))
  }, [tablePerPage, currentPage])

  const handleNextClick = () => {
    if (currentPage < Math.ceil(tableTotal / tablePerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const onRowsChange = (_row: unknown, value: string) => {
    setTablePerPage(Number(value))
    setCurrentPage(1)
  }

  const currentItemFrom = (currentPage - 1) * tablePerPage + 1
  const currentItemTo = Math.min(currentItemFrom + tablePerPage - 1, tableTotal)

  const tableOrdersSchema = {
    properties: {
      orderId: {
        title: 'Order ID',
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return <div>{cellData}</div>
        },
      },
      type: {
        title: 'Type',
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return <div>{cellData}</div>
        },
      },
      transactionId: {
        title: 'Transaction',
        width: 310,
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return <div>{cellData}</div>
        },
      },
      orderLink: {
        title: 'Order URL',
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return (
            <Link href={cellData} target="_blank">
              {cellData}
            </Link>
          )
        },
      },
      amount: {
        title: 'Amount',
        width: 110,
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return (
            <div className="w-50 flex justify-center">
              {Number(cellData) / 100}
            </div>
          )
        },
      },
      currency: {
        title: 'Currency',
        width: 110,
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return <div className="w-70 flex justify-center">{cellData}</div>
        },
      },
      description: {
        title: 'Description',
        width: 310,
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return <div style={{ overflow: 'auto' }}>{cellData}</div>
        },
      },
      createdAt: {
        title: 'Date',
        cellRenderer: ({ cellData }: { cellData: Date }): JSX.Element => {
          return <div>{formatDate(new Date(cellData))}</div>
        },
      },
    },
  }

  return (
    <div>
      <Table
        loading={isLoading}
        fullWidth
        schema={tableOrdersSchema}
        items={transfers}
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
          currentItemFrom,
          currentItemTo,
          onNextClick: handleNextClick,
          onPrevClick: handlePrevClick,
          currentPage,
          onRowsChange,
          textOf: 'of',
          totalItems: tableTotal,
          rowsOptions: [2, 5, 10, 15, 25],
          selectedOption: tablePerPage,
        }}
      />
    </div>
  )
}

export default TransfersTable
