import React, { useEffect, useState } from 'react'
import { Table, Button, Toggle, Tooltip, Alert } from 'vtex.styleguide'
import type { AxiosError } from 'axios'
import { format } from 'date-fns'

import EstimatedFulfilment from './EstimatedFulfilment'
import {
  fulfillSKUStock,
  getSkus,
  updateSku,
  updateSkuAvailablePreorder,
} from '../services/sku'
import type {
  EstimatedFulfillment,
  Sku,
  SKUFiltersProps,
} from '../types/skuTypes'
import { getErrorMessage } from '../utils/error.utils'
import Warehouses from './Warehouses'
import { convertToObjectFulfilment } from '../utils/date.utils'
import DeliveryDisable from '../icons/DeliveryDisable.svg'
import DeliveryEnable from '../icons/DeliveryEnable.svg'
import CostumeInput from '../utils/costumeInput'
import { AlertType } from '../types/common'
import SkuPagination from './SkuPagination'

const SkuTable = ({
  searchedVal,
  skuFilters,
}: {
  searchedVal: string
  skuFilters: SKUFiltersProps
}) => {
  const [tableItems, setTableItems] = useState<{
    [key: number]: Sku
  }>([])

  const [selectedWarehouses, setSelectedWarehouses] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [updateError, setUpdateError] = useState<{
    text: string
    type: AlertType
  }>({ text: '', type: AlertType.ERROR })

  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>()
  const [emptyTableMessage, setEmptyTableMessage] = useState<string>(
    'Nothing to show'
  )

  const [futureStock, setFutureStock] = useState<{
    [skuKey: string]: { [whKey: string]: number }
  }>({})

  const [currentStock, setCurrentStock] = useState<{
    [skuKey: string]: { [whKey: string]: number }
  }>({})

  const [isFulfillStock, setIsFulfillStock] = useState<{
    [skuKey: string]: { [whKey: string]: boolean }
  }>({})

  const [isAvailableToFulfill, setIsAvailableToFulfill] = useState<{
    [skuKey: string]: { [whKey: string]: boolean }
  }>({})

  const [fulfillment, setFulfilment] = useState<{
    [skuKey: string]: { [whKey: string]: EstimatedFulfillment | null }
  }>({})

  const [preorderAvailable, setPreorderAvailable] = useState<{
    [key: number]: boolean
  }>({})

  const [tableRows, setTableRows] = useState(10)
  const [updateTable, setUpdateTable] = useState(false)
  const [page, setPage] = useState(1)

  const changeSelectedWarehouse = (value: string, skuId: number) => {
    setSelectedWarehouses({ ...selectedWarehouses, [skuId]: value })
    setFutureStock({
      ...futureStock,
      [skuId]: {
        [value]: tableItems[skuId].warehouseIds[value].futureStock,
      },
    })
    setCurrentStock({
      ...currentStock,
      [skuId]: {
        [value]: tableItems[skuId].warehouseIds[value].currentStock,
      },
    })
    setIsFulfillStock({
      ...isFulfillStock,
      [skuId]: {
        [value]: tableItems[skuId].warehouseIds[value].fulfill,
      },
    })
    setIsAvailableToFulfill({
      ...isAvailableToFulfill,
      [skuId]: {
        [value]: !!tableItems[skuId].warehouseIds[value].futureStock,
      },
    })

    setFulfilment({
      ...fulfillment,
      [skuId]: {
        [value]: tableItems[skuId].warehouseIds[value].estimatedFulfillment,
      },
    })
  }

  const changeFulfilment = (
    value: string,
    skuId: number,
    warehouseId: string
  ) => {
    setFulfilment({
      ...fulfillment,
      [skuId]: { [warehouseId]: convertToObjectFulfilment(value) },
    })
  }

  useEffect(() => {
    setIsLoading(true)
    getSkus({
      pageSize: tableRows,
      query: searchedVal,
      filters: skuFilters,
      page,
    })
      .then(resp => {
        if (Object.keys(resp).length) {
          setTableItems(resp)
        } else {
          setTableItems({})
        }
      })
      .catch(e => {
        setTableItems({})
        setEmptyTableMessage(getErrorMessage(e))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [searchedVal, skuFilters, updateTable, tableRows, page])

  const updateOrder = (rowData: { id: number }) => {
    const { id } = rowData
    const thisRowWarehouseId = selectedWarehouses[id]
    const futureStk = futureStock[id][thisRowWarehouseId]
    const currentStk = currentStock[id][thisRowWarehouseId]

    setIsUpdating({ [id]: true })
    updateSku({
      futureStock: Number(futureStk),
      currentStock: Number(currentStk),
      skuId: rowData.id,
      warehouseId: thisRowWarehouseId,
      estimatedFulfillment: fulfillment[id][thisRowWarehouseId],
    })
      .then(res => {
        setTableItems(prev => ({ ...prev, [res.id]: res }))
        setUpdateError({ text: 'Successful updated!', type: AlertType.SUCCESS })
      })
      .catch((e: AxiosError) => {
        if (
          Array.isArray(e.response?.data?.message) &&
          e.response?.data?.message[0]
        ) {
          setUpdateError({
            text: e.response.data.message[0],
            type: AlertType.ERROR,
          })
        } else if (e.response?.data) {
          setUpdateError({ text: e.response.data, type: AlertType.ERROR })
        } else {
          setUpdateError({
            text: 'Something went wrong, check the console.',
            type: AlertType.ERROR,
          })
        }
      })
      .finally(() => setIsUpdating({ [id]: false }))
  }

  const changeIsAvailableForPreorder = (id: number, state: boolean) => {
    setPreorderAvailable({ ...preorderAvailable, [id]: state })
    updateSkuAvailablePreorder({ skuId: id, isAvailableForPreOrder: state })
  }

  const fulfillSku = (skuId: number, warehouseId: string) => {
    fulfillSKUStock({ skuId, warehouseId }).then(() => {
      setUpdateTable(!updateTable)
    })
  }

  const tableOrdersSchema = {
    properties: {
      imageUrl: {
        title: 'img',
        width: 80,
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return <img src={cellData} alt="product" />
        },
      },
      id: {
        title: 'SKU',
        width: 100,
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return <div className="content-start">{cellData}</div>
        },
      },
      productName: {
        title: 'Product name',
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return (
            <Tooltip label={`${cellData} `}>
              <div className="content-start">{cellData}</div>
            </Tooltip>
          )
        },
      },
      warehouseId: {
        title: 'Warehouse ID',
        width: 210,
        cellRenderer: ({ rowData }: { rowData: Sku }): JSX.Element => {
          return (
            <div className="w-100 flex justify-center">
              <Warehouses
                setFulfilment={setFulfilment}
                rowData={rowData}
                setWarehouse={setSelectedWarehouses}
                warehouses={selectedWarehouses}
                changeSelectedWarehouse={changeSelectedWarehouse}
                setFutureStock={setFutureStock}
                setCurrentStock={setCurrentStock}
                setIsFulfillStock={setIsFulfillStock}
                setIsAvailableToFulfill={setIsAvailableToFulfill}
                tableItems={tableItems}
              />
            </div>
          )
        },
      },
      skuName: {
        title: 'SKU Name',
        width: 200,
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return (
            <Tooltip label={`${cellData} `}>
              <div className="content-start">{cellData}</div>
            </Tooltip>
          )
        },
      },
      availableStock: {
        title: 'Available Stock',
        width: 110,
        cellRenderer: ({ rowData }: { rowData: Sku }): JSX.Element => {
          const { currentStock: cS, reservedStock: rS } = rowData.totals

          return (
            <div className="w-100 flex justify-center">
              {Math.max(0, cS - rS)}
            </div>
          )
        },
      },
      currentStock: {
        title: <div className="w-100 tc">Current stock</div>,
        width: 160,
        cellRenderer: ({ rowData }: { rowData: Sku }): JSX.Element => {
          return (
            <div className="flex flex-column justify-around items-center">
              <CostumeInput
                type="number"
                value={Math.max(
                  0,
                  currentStock[rowData.id]
                    ? currentStock[rowData.id][selectedWarehouses[rowData.id]]
                    : 0
                )}
                onChange={e => {
                  setCurrentStock({
                    ...currentStock,
                    [rowData.id]: {
                      [selectedWarehouses[rowData.id]]: e.target.value,
                    },
                  })
                }}
              />
            </div>
          )
        },
      },
      total: {
        title: <div className="w-100 tc">Future stock</div>,
        width: 160,
        cellRenderer: ({ rowData }: { rowData: Sku }): JSX.Element => {
          const warehouseObjById =
            tableItems[rowData.id].warehouseIds[selectedWarehouses[rowData.id]]

          return (
            <div className="flex flex-column justify-around items-center">
              <CostumeInput
                type="number"
                value={Math.max(
                  0,
                  futureStock[rowData.id]
                    ? futureStock[rowData.id][selectedWarehouses[rowData.id]]
                    : 0
                )}
                onChange={e => {
                  setFutureStock({
                    ...futureStock,
                    [rowData.id]: {
                      [selectedWarehouses[rowData.id]]: e.target.value,
                    },
                  })
                }}
              />
              {warehouseObjById?.updatedAt && (
                <div className="f7">
                  updated at:
                  {format(new Date(warehouseObjById?.updatedAt), 'dd MMM yyyy')}
                </div>
              )}
            </div>
          )
        },
      },
      fulfill: {
        title: 'Fulfill',
        width: 70,
        cellRenderer: ({ rowData }: { rowData: Sku }): JSX.Element => {
          const isReadyToFulfill =
            isAvailableToFulfill[rowData.id] &&
            isAvailableToFulfill[rowData.id][selectedWarehouses[rowData.id]]

          return (
            <div
              role="button"
              className={`w-100 flex justify-center ${
                isReadyToFulfill && 'pointer'
              }`}
              onClick={() => {
                if (isReadyToFulfill) {
                  fulfillSku(rowData.id, selectedWarehouses[rowData.id])
                }
              }}
            >
              {isFulfillStock[rowData.id] && (
                <img
                  width={38}
                  height={38}
                  src={isReadyToFulfill ? DeliveryEnable : DeliveryDisable}
                  alt=""
                />
              )}
            </div>
          )
        },
      },
      price: {
        title: 'Price',
        width: 70,
        cellRenderer: ({ cellData }: { cellData: string }): JSX.Element => {
          return <div className="w-100 flex justify-center">{cellData}</div>
        },
      },
      isAvailableForPreOrder: {
        title: 'Pre-order',
        width: 80,
        cellRenderer: ({ rowData }: { rowData: Sku }): JSX.Element => {
          return (
            <Toggle
              checked={
                typeof preorderAvailable[rowData.id] === 'undefined'
                  ? rowData.isAvailableForPreOrder
                  : preorderAvailable[rowData.id]
              }
              onChange={() => {
                const isPreorder =
                  typeof preorderAvailable[rowData.id] === 'undefined'
                    ? !rowData.isAvailableForPreOrder
                    : !preorderAvailable[rowData.id]

                changeIsAvailableForPreorder(rowData.id, isPreorder)
              }}
            />
          )
        },
      },
      estimatedFulfilment: {
        title: 'Estimated fulfilment',
        width: 190,
        cellRenderer: ({ rowData }: { rowData: Sku }): JSX.Element => {
          return (
            <>
              {fulfillment[rowData.id] ? (
                <EstimatedFulfilment
                  fulfillment={fulfillment[rowData.id]}
                  rowData={rowData}
                  changeFulfilment={changeFulfilment}
                />
              ) : null}
            </>
          )
        },
      },
      actions: {
        title: 'Actions',
        headerRight: true,
        width: 170,
        cellRenderer: ({ rowData }: { rowData: Sku }): JSX.Element => {
          return (
            <div className="center w-100  ml7-l flex justify-center">
              <Button
                isLoading={isUpdating ? isUpdating[rowData.id] : false}
                size="small"
                block
                onClick={() => updateOrder(rowData)}
              >
                Update
              </Button>
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
        emptyStateLabel={emptyTableMessage}
        fullWidth
        loading={isLoading}
        schema={tableOrdersSchema}
        items={Object.values(tableItems)}
        toolbar={{
          density: {
            alignMenu: 'right',
            buttonLabel: 'Line density',
            lowOptionLabel: 'Low',
            mediumOptionLabel: 'Medium',
            highOptionLabel: 'High',
          },
        }}
      />
      {!!Object.keys(tableItems).length && (
        <SkuPagination
          page={page}
          setPage={setPage}
          setRows={setTableRows}
          rows={tableRows}
          returnedItems={Object.keys(tableItems).length}
        />
      )}
    </div>
  )
}

export default SkuTable
