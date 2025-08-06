import type { Dispatch, SetStateAction } from 'react'
import React, { useState } from 'react'
import { Button, Modal } from 'vtex.styleguide'

import type {
  PreorderItem,
  NormalizedPreorderItem,
} from '../../types/preordersTypes'
import {
  areItemsChecked,
  getCheckboxProductsStructure,
} from '../../utils/array.utils'
import ProductCheckboxInfo from './ProductCheckboxInfo'

function ProductsCancelModal({
  vendorOrderId,
  setIdPreorderModal,
  productList,
  setSelectedProductsToCancel,
}: {
  vendorOrderId: string
  setIdPreorderModal: Dispatch<React.SetStateAction<string | null>>
  productList: PreorderItem[]
  setSelectedProductsToCancel: Dispatch<
    SetStateAction<{
      [orderId: string]: Array<{ skuId: number; quantity: number }>
    }>
  >
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [checkedProducts, setCheckedProducts] = useState<{
    [key: string]: { checked: boolean; orderItemId: string; count?: number }
  }>({})

  const normalizedProducts: {
    [key: string]: NormalizedPreorderItem
  } = getCheckboxProductsStructure(productList)

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen)
  }

  const confirmCancel = () => {
    const checkedResult = Object.entries(checkedProducts)
      .filter(([_key, val]) => {
        const { canceled, processed, total } = normalizedProducts[_key]

        return val.checked && total - canceled - processed
      })
      .map(([key, _val]) => ({ skuId: Number(key), quantity: _val.count ?? 1 }))

    setSelectedProductsToCancel(prev => ({
      ...prev,
      [vendorOrderId]: checkedResult,
    }))
    setIsModalOpen(false)
    setIdPreorderModal(vendorOrderId)
  }

  return (
    <div className="center w-40  ml1 flex justify-center">
      <Button size="small" variation="danger" block onClick={handleModalToggle}>
        Cancel
      </Button>
      <Modal
        closeOnOverlayClick={false}
        centered
        isOpen={isModalOpen}
        onClose={handleModalToggle}
      >
        <div className="dark-gray">
          <div className="mb7">
            <h5>Please select the items you would like to cancel</h5>
          </div>
          <div className="mb7">
            <ProductCheckboxInfo
              checkedProducts={checkedProducts}
              normalizedProducts={normalizedProducts}
              setCheckedProducts={setCheckedProducts}
            />
          </div>
          <div className="center w-60 flex justify-center">
            <div className="mr7 w-25">
              <Button
                disabled={!areItemsChecked(checkedProducts)}
                onClick={confirmCancel}
                block
              >
                Confirm
              </Button>
            </div>
            <div className="mr7 w-25">
              <Button
                className="w-25"
                block
                onClick={() => setIsModalOpen(false)}
                variation="danger"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProductsCancelModal
