import type { Dispatch, SetStateAction } from 'react'
import React, { useEffect } from 'react'
import { Dropdown } from 'vtex.styleguide'

import type { Sku, EstimatedFulfillment } from '../types/skuTypes'

function Warehouses({
  rowData,
  setWarehouse,
  warehouses,
  changeSelectedWarehouse,
  setFutureStock,
  setFulfilment,
  setCurrentStock,
  setIsFulfillStock,
  setIsAvailableToFulfill,
  tableItems,
}: {
  rowData: Sku
  tableItems: { [p: number]: Sku }
  warehouses: { [key: string]: string }
  setWarehouse: Dispatch<SetStateAction<{ [key: string]: string }>>
  setFutureStock: Dispatch<
    SetStateAction<{ [skuKey: string]: { [whKey: string]: number } }>
  >
  setCurrentStock: Dispatch<
    SetStateAction<{ [skuKey: string]: { [whKey: string]: number } }>
  >
  setIsFulfillStock: Dispatch<
    SetStateAction<{ [skuKey: string]: { [whKey: string]: boolean } }>
  >
  setIsAvailableToFulfill: Dispatch<
    SetStateAction<{ [skuKey: string]: { [whKey: string]: boolean } }>
  >
  changeSelectedWarehouse: (value: string, skuId: number) => void
  setFulfilment: Dispatch<
    SetStateAction<{
      [skuKey: string]: { [whKey: string]: EstimatedFulfillment | null }
    }>
  >
}) {
  const getWarehousesOptions = (): Array<{ value: string; label: string }> => {
    return Object.values(rowData.warehouseIds).map(el => {
      return { value: el.id, label: el.name }
    })
  }

  useEffect(() => {
    setWarehouse(prevState => ({
      ...prevState,
      [rowData.id]: getWarehousesOptions()[0].value,
    }))

    setFutureStock(prevState => ({
      ...prevState,
      [rowData.id]: {
        [Object.keys(rowData.warehouseIds)[0]]: Object.values(
          rowData.warehouseIds
        )[0].futureStock,
      },
    }))
    setCurrentStock(prevState => ({
      ...prevState,
      [rowData.id]: {
        [Object.keys(rowData.warehouseIds)[0]]: Object.values(
          rowData.warehouseIds
        )[0].currentStock,
      },
    }))
    setIsAvailableToFulfill(prevState => ({
      ...prevState,
      [rowData.id]: {
        [Object.keys(rowData.warehouseIds)[0]]: !!Object.values(
          rowData.warehouseIds
        )[0].futureStock,
      },
    }))

    setIsFulfillStock(prevState => ({
      ...prevState,
      [rowData.id]: {
        [Object.keys(rowData.warehouseIds)[0]]: Object.values(
          rowData.warehouseIds
        )[0].fulfill,
      },
    }))

    setFulfilment(prevState => ({
      ...prevState,
      [rowData.id]: {
        [Object.keys(rowData.warehouseIds)[0]]:
          Object.values(rowData.warehouseIds)[0].estimatedFulfillment || null,
      },
    }))
  }, [tableItems])

  return (
    <div className="mb1 w-100">
      <Dropdown
        size="small"
        options={getWarehousesOptions()}
        value={warehouses[rowData.id]}
        onChange={(_: unknown, v: string) => {
          changeSelectedWarehouse(v, rowData.id)
        }}
      />
    </div>
  )
}

export default Warehouses
