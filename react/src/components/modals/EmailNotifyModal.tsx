import type { SetStateAction } from 'react'
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
import { notifyUserMail } from '../../services/preorders'

function EmailNotifyModal({
  vendorOrderId,
  productList,
  setNotificationMessage,
}: {
  vendorOrderId: string
  productList: PreorderItem[]
  setNotificationMessage: React.Dispatch<
    SetStateAction<{ text: string; type: string }>
  >
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
    const matchResult = vendorOrderId.match(/-(\d+-\d+)/)

    if (matchResult !== null) {
      const extractedPart = matchResult[1]
      const selectedProducts = productList.reduce(
        (acc: Array<{ ImageUrl: string; SkuName: string }>, product) => {
          if (checkedProducts[product.skuId]?.checked) {
            acc.push({
              ImageUrl: product.imageUrl || '',
              SkuName: product.name,
            })
          }

          return acc
        },
        []
      )

      setIsLoading(true)
      notifyUserMail(extractedPart, selectedProducts)
        .then(r => {
          console.log('response-', r)
          if (r) {
            setNotificationMessage({
              text: 'Email sent successfully!',
              type: 'success',
            })
          }
        })
        .catch(() =>
          setNotificationMessage({ text: 'Error notification!', type: 'error' })
        )
        .finally(() => setIsLoading(false))
    }

    setIsModalOpen(false)
  }

  return (
    <div>
      <Button
        size="small"
        block
        onClick={handleModalToggle}
        isLoading={isLoading}
      >
        Notify
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
          <h4>
            Please select the items that are fulfilled so that the user can be
            notified that they will soon be processed, and the corresponding
            amount will be charged from credit card .
          </h4>
        </div>

        <div className="mb7">
          <ProductCheckboxInfo
            checkedProducts={checkedProducts}
            normalizedProducts={normalizedProducts}
            setCheckedProducts={setCheckedProducts}
            isNotifyModal
          />
        </div>
        <div className="center w-60 flex justify-center">
          <div className="mr7 w-40">
            <Button
              disabled={!areItemsChecked(checkedProducts)}
              onClick={confirmOrder}
              block
            >
              Notify user
            </Button>
          </div>
          <div className="mr7 w-40">
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

export default EmailNotifyModal
