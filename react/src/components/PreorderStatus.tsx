import React from 'react'
import { Tooltip } from 'vtex.styleguide'

import { PreorderStatuses } from '../constants/preorder'
import type { FormattedOrderStatus } from '../types/preordersTypes'
import CostumeTag from '../utils/costumeTag'

const getFormattedStatus = (status: string): FormattedOrderStatus => {
  switch (status) {
    case PreorderStatuses.READY_FOR_HANDLING:
      return {
        longText: 'Ready for handling',
        shortText: 'RFH',
        bgColor: '#47c466',
      }

    case PreorderStatuses.IN_PROGRESS:
      return {
        longText: 'In progress',
        shortText: 'In progress',
        bgColor: '#02a182',
      }

    case PreorderStatuses.READY_FOR_SHIPMENT:
      return {
        longText: 'Ready for shipment',
        shortText: 'RFS',
        bgColor: '#1fa102',
      }

    case PreorderStatuses.SHIPPED:
      return {
        longText: 'Shipped',
        shortText: 'Shipped',
        bgColor: '#4c01d0',
      }

    case PreorderStatuses.INVOICED:
      return {
        longText: 'Invoiced',
        bgColor: '#0243a0',
        shortText: 'Invoiced',
      }

    case PreorderStatuses.CANCELLED:
      return {
        longText: 'Canceled',
        bgColor: '#e11010',
        shortText: 'Canceled',
      }

    case PreorderStatuses.HANDLING:
      return {
        longText: 'Handling ',
        bgColor: '#e08029',
        shortText: 'Handling',
      }

    default:
      return {
        longText: status,
        bgColor: '#00000c',
        shortText: status,
      }
  }
}

function PreorderStatus({ status }: { status: string }) {
  return (
    <>
      <Tooltip label={getFormattedStatus(status).longText} position="bottom">
        <div>
          <CostumeTag bgColor={getFormattedStatus(status).bgColor}>
            {getFormattedStatus(status).shortText ? (
              <span className="fw3 f7 ph4 flex">
                {getFormattedStatus(status).shortText}
              </span>
            ) : (
              <span className="fw3 f7 helvetica">
                {getFormattedStatus(status).longText}
              </span>
            )}
          </CostumeTag>
        </div>
      </Tooltip>
    </>
  )
}

export default PreorderStatus
