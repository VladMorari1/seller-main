import React, { useEffect, useState } from 'react'
import { Tooltip } from 'vtex.styleguide'
import CostumeTag from '../utils/costumeTag'
import { ORDER_STATUSES } from '../constants/order'

const getFormattedStatus = (status: string) => {
  return ORDER_STATUSES.find(s => s.id === status) ?? { id: status, name: status }
}

function OrderStatus({ status }: { status: string }) {
  const [formattedStatus, setFormattedStatus] = useState<any>(undefined)

  useEffect(() => {
    setFormattedStatus(getFormattedStatus(status))
  }, [])

  return (
    <>
      <Tooltip label={formattedStatus?.name} position="bottom">
        <div>
          <CostumeTag bgColor={formattedStatus?.type === 'red'? '#ef6e4a' : formattedStatus?.type === 'yellow'? '#f6cc18' : '#34d52b'}>
            <span className="fw4 f7 helvetica">
              {formattedStatus?.name}
            </span>
          </CostumeTag>
        </div>
      </Tooltip>
    </>
  )
}

export default OrderStatus
