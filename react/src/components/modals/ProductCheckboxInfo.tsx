import type { Dispatch, SetStateAction } from 'react'
import React from 'react'
import { Checkbox, NumericStepper } from 'vtex.styleguide'

import type { NormalizedPreorderItem } from '../../types/preordersTypes'
import { months } from '../../utils/date.utils'

function ProductCheckboxInfo({
  normalizedProducts,
  checkedProducts,
  setCheckedProducts,
  isNotifyModal,
}: {
  normalizedProducts: { [k: string]: NormalizedPreorderItem }
  checkedProducts: {
    [k: string]: {
      checked: boolean
      orderItemId: string
      count?: number | undefined
    }
  }
  setCheckedProducts: Dispatch<
    SetStateAction<{
      [k: string]: {
        checked: boolean
        orderItemId: string
        count?: number | undefined
      }
    }>
  >
  isNotifyModal?: boolean
}) {
  return (
    <>
      {Object.entries(normalizedProducts).map(([key, value]) => {
        return (
          <div key={key} className="flex items-center justify-between mb4">
            <div className={isNotifyModal ? 'flex w-60' : 'flex w-30'}>
              <Checkbox
                disabled={!(value.total - value.processed - value.canceled)}
                checked={!!checkedProducts[key]?.checked}
                label={value.name}
                id={value.skuId}
                onChange={(e: {
                  target: { checked: boolean }
                  persist: () => void
                }) => {
                  e.persist()
                  setCheckedProducts(prev => ({
                    ...prev,
                    [key]: {
                      ...prev[key],
                      checked: e.target?.checked,
                      orderItemId: value.orderItemId,
                    },
                  }))
                }}
                value={value.name}
              />
            </div>

            <img
              width={38}
              height={38}
              className="ba b--gray br2"
              src={
                value.imageUrl ||
                'https://cdn.vectorstock.com/i/preview-1x/48/06/image-preview-icon-picture-placeholder-vector-31284806.jpg'
              }
              alt=""
            />
            <NumericStepper
              size="small"
              value={
                checkedProducts[key]?.count ??
                (value.total - value.processed - value.canceled ? 1 : 0)
              }
              onChange={(event: { value: number }) => {
                setCheckedProducts(prev => ({
                  ...prev,
                  [key]: {
                    ...prev[key],
                    count: event.value,
                  },
                }))
              }}
              maxValue={value.total - value.processed - value.canceled}
              minValue={1}
            />
            {!isNotifyModal && (
              <>
                <div className="f7 flex flex-column items-center justify-center">
                  <div className="mb2">Processed</div>{' '}
                  <div>{value.processed}</div>
                </div>
                <div className="f7 flex flex-column items-center justify-center">
                  <div className="mb2">Canceled</div>{' '}
                  <div>{value.canceled}</div>
                </div>
                <div className="f7 flex flex-column items-center justify-center">
                  <div className="mb2">Estimated fulfillment</div>
                  {value.soonestFulfillment ? (
                    <div>
                      {value.soonestFulfillment.partOfMonth} of{' '}
                      {months[value.soonestFulfillment.month]},{' '}
                      {value.soonestFulfillment.year}
                    </div>
                  ) : (
                    <div>Waiting for fulfillment</div>
                  )}
                </div>
              </>
            )}
          </div>
        )
      })}
    </>
  )
}

export default ProductCheckboxInfo
