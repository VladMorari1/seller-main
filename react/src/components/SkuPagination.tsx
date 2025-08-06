import React, { useEffect, useState } from 'react'
import { Pagination } from 'vtex.styleguide'

function SkuPagination({
  setRows,
  rows,
  page,
  setPage,
  returnedItems,
}: {
  rows: number
  setRows: React.Dispatch<React.SetStateAction<number>>
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  returnedItems: number
}) {
  const [total, setTotal] = useState(Infinity)
  const [fromTo, setFromTo] = useState({ from: 1, to: 5 })

  const handleRowsChange = (_e: unknown, val: string) => {
    setRows(Number(val))
  }

  const handleNextClick = () => {
    setPage(page + 1)
  }

  const handleBackClick = () => {
    setPage(page - 1)
  }

  useEffect(() => {
    if (returnedItems !== rows) {
      setFromTo({ from: fromTo.from, to: fromTo.from + (returnedItems - 1) })
      setTotal(fromTo.from + (returnedItems - 1))
    } else {
      setFromTo({ from: (page - 1) * rows + 1, to: rows * page })
      setTotal(Infinity)
    }
  }, [page, returnedItems])

  useEffect(() => {
    setPage(1)
    setFromTo({ from: 1, to: rows })
    setTotal(Infinity)
  }, [rows])

  return (
    <div>
      <Pagination
        rowsOptions={[5, 10, 15, 20]}
        currentItemFrom={fromTo.from}
        currentItemTo={fromTo.to}
        textOf={total < Infinity ? 'of' : ''}
        textShowRows="Rows"
        totalItems={total < Infinity ? total : <div />}
        onRowsChange={handleRowsChange}
        onNextClick={handleNextClick}
        onPrevClick={handleBackClick}
      />
    </div>
  )
}

export default SkuPagination
