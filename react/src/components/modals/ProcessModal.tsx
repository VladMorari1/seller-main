import React, { useState } from 'react'
import type { Dispatch } from 'react'
import { Button, Modal } from 'vtex.styleguide'

import { processPreorder } from '../../services/preorders'
import { AlertType } from '../../types/common'

function ProcessModal({
  vendorOrderId,
  selectedIdPreorderModal,
  setIdProcessModalOpen,
  selectedProducts,
  setRefreshTableData,
  setUpdateError,
}: {
  vendorOrderId: string
  selectedIdPreorderModal: string | null
  setIdProcessModalOpen: Dispatch<React.SetStateAction<string | null>>
  selectedProducts: {
    [orderId: string]: Array<{ skuId: number; quantity: number }>
  }
  setRefreshTableData: Dispatch<React.SetStateAction<boolean>>
  setUpdateError: React.Dispatch<
    React.SetStateAction<{ text: string; type: AlertType }>
  >
}) {
  const [isLoading, setIsLoading] = useState(false)

  const confirmOrder = () => {
    setIsLoading(true)
    processPreorder(vendorOrderId, selectedProducts[vendorOrderId])
      .then(() => {
        setUpdateError({
          text: 'Completed with success!',
          type: AlertType.SUCCESS,
        })
      })
      .catch(() => {
        setUpdateError({
          text: 'Something went wrong, check the console.',
          type: AlertType.ERROR,
        })
      })
      .finally(() => {
        setIsLoading(false)
        setRefreshTableData(prev => !prev)
        setIdProcessModalOpen(null)
      })
  }

  return (
    <Modal
      closeOnOverlayClick={false}
      centered
      isOpen={selectedIdPreorderModal === vendorOrderId}
      onClose={() => {
        setIdProcessModalOpen(null)
      }}
    >
      <div className="dark-gray">
        <div className="mb7">
          <p className="f3 f3-ns fw3 gray">
            Are you sure you want to confirm the order?
          </p>
          <p>You have to ship the order within 24h after confirming</p>
        </div>
        <div className="center w-60 flex justify-center">
          <div className="mr7 w-25">
            <Button isLoading={isLoading} onClick={confirmOrder} block>
              Yes
            </Button>
          </div>
          <div className="mr7 w-25">
            <Button
              className="w-25"
              block
              onClick={() => setIdProcessModalOpen(null)}
              variation="danger"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ProcessModal
