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

function ProductsProcessModal({
  vendorOrderId,
  setIdPreorderModal,
  productList,
  setSelectedProductsToProcess,
}: {
  vendorOrderId: string
  setIdPreorderModal: Dispatch<React.SetStateAction<string | null>>
  productList: PreorderItem[]
  setSelectedProductsToProcess: Dispatch<
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

  const confirmOrder = () => {
    const checkedResult = Object.entries(checkedProducts)
      .filter(([_key, val]) => {
        const { canceled, processed, total } = normalizedProducts[_key]

        return val.checked && total - canceled - processed
      })
      .map(([key, _val]) => ({ skuId: Number(key), quantity: _val.count ?? 1 }))

    setSelectedProductsToProcess(prev => ({
      ...prev,
      [vendorOrderId]: checkedResult,
    }))
    setIsModalOpen(false)
    setIdPreorderModal(vendorOrderId)
  }

  return (
    <div className="center w-40  ml7-l flex justify-center">
      <Button size="small" block onClick={handleModalToggle}>
        Process
      </Button>
      <Modal
        closeOnOverlayClick={false}
        centered
        isOpen={isModalOpen}
        responsiveFullScreen
        onClose={handleModalToggle}
        showBottomBarBorder
      >
        <div className="mb7">
          <h5>
            Please select the items and quantity you would like to process
          </h5>
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
              onClick={confirmOrder}
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
      </Modal>
    </div>
  )
}

export default ProductsProcessModal
