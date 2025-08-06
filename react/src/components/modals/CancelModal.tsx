import type { Dispatch } from 'react'
import React, { useState } from 'react'
import { Button, Modal } from 'vtex.styleguide'

import { cancelPreorder } from '../../services/preorders'

function CancelModal({
  vendorOrderId,
  selectedIdPreorderModal,
  setIdCancelModalOpen,
  selectedProductsToCancel,
  setRefreshTableData,
}: {
  vendorOrderId: string
  selectedIdPreorderModal: string | null
  setIdCancelModalOpen: Dispatch<React.SetStateAction<string | null>>
  selectedProductsToCancel: {
    [orderId: string]: Array<{ skuId: number; quantity: number }>
  }
  setRefreshTableData: Dispatch<React.SetStateAction<boolean>>
}) {
  const [isLoading, setIsLoading] = useState(false)

  const cancelOrder = () => {
    setIsLoading(true)
    cancelPreorder(
      vendorOrderId,
      selectedProductsToCancel[vendorOrderId]
    ).finally(() => {
      setIsLoading(false)
      setRefreshTableData(prev => !prev)
      setIdCancelModalOpen(null)
    })
  }

  return (
    <Modal
      closeOnOverlayClick={false}
      centered
      isOpen={selectedIdPreorderModal === vendorOrderId}
      onClose={() => setIdCancelModalOpen(null)}
    >
      <div className="dark-gray">
        <div className="mb7">
          <p className="f3 f3-ns fw3 gray">
            You are going to cancel the Preorder, this action cannot be undone.
          </p>
          <p>Are you sure you want to proceed?</p>
        </div>
        <div className="center w-60 flex justify-center">
          <div className="mr7 w-25">
            <Button isLoading={isLoading} onClick={cancelOrder} block>
              Yes
            </Button>
          </div>
          <div className="mr7 w-25">
            <Button
              className="w-25"
              block
              onClick={() => setIdCancelModalOpen(null)}
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

export default CancelModal
