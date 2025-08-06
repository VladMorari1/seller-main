import React, { useCallback, useEffect, useState } from 'react'
import type { Dispatch } from 'react'
import { ButtonPlain, IconCopy, IconLink, Modal, ToastConsumer } from 'vtex.styleguide'
import OrderProductsTable from '../orderDetails/OrderProductsTable'
import { getStripe } from '../../services/stripes'
import { ORDER_STATUSES } from '../../constants/order'

function OrderDetailsModal({
  selectedOrder,
  setSelectedOrder,
}: {
  selectedOrder: any
  setSelectedOrder: Dispatch<React.SetStateAction<any>>
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [stripe, setStripe] = useState<any>(undefined)

  useEffect(() => {
    if (selectedOrder?.orderId) {
      setIsLoading(true)

      getStripe(selectedOrder.orderId.split('-')[1])
        .then(res => setStripe(res))
        .catch(err => console.log(err))
        .finally(() => setIsLoading(false))
    }
  }, [selectedOrder])

  const getTotals = useCallback(
    () => {
      const jsx = selectedOrder?.orderDetails.totals.map((total: any) => {
        return (
          <div className='fw4 mt4 mh4 f6' style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <div>{total.name}</div>
            <div>
              {(total.value / 100).toFixed(2)} AUD
            </div>
          </div>
        )
      })

      jsx.push(
        <div className='fw5 mt4 mh4 f6' style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div>Grand total</div>
          <div>
            {((selectedOrder?.orderDetails.totals as Array<any>).reduce((acc, curr) => acc + curr.value, 0) / 100).toFixed(2)} AUD
          </div>
        </div>
      )

      return jsx
    },
    [selectedOrder],
  )

  return (
    <Modal
      closeOnOverlayClick={false}
      centered
      size="fit-horizontally"
      isOpen={selectedOrder}
      onClose={() => {
        setSelectedOrder(undefined)
      }}
    >
      <div className="dark-gray">
        <div className="mb7">
          <p className="f4 fw4">
            {selectedOrder?.orderId}
            <span className='ml6'>
              <ButtonPlain onClick={() =>{window.open(`${window.location.origin}/admin/orders/${selectedOrder?.orderId}`)}}>
                <IconLink size={14} />
                </ButtonPlain>
            </span>
            <span className='ml3'>
              <ToastConsumer>
                { ({ showToast }: { showToast: any }) => (
                  <ButtonPlain onClick={() => {
                    navigator.clipboard.writeText(selectedOrder?.orderId)
                    showToast('Copied to Clipboard')
                    }}>
                    <IconCopy size={14} />
                  </ButtonPlain>
                )}
              </ToastConsumer>
            </span>
          </p>
          {
            selectedOrder?
            <>
              <div className='f6'>
                <div className='mb3'>
                  <span style={{minWidth: '90px', display: 'inline-block'}}>Status:</span>
                  <span className='fw5 ml3'>{ORDER_STATUSES.find(d => d.id === selectedOrder.status)?.name}</span>
                </div>
                <div className='mb3'>
                  <span style={{minWidth: '90px', display: 'inline-block'}}>Created at:</span>
                  <span className='fw5 ml3'>
                    {new Date(selectedOrder.createdAt).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true })}
                  </span>
                </div>
                <div className='mb3'>
                  <span style={{minWidth: '90px', display: 'inline-block'}}>Client:</span>
                  <span className='fw5 ml3'>
                    {`${selectedOrder.client.firstName} ${selectedOrder.client.lastName}`}
                  </span>
                </div>
                <div className='mb3'>
                  <span style={{minWidth: '90px', display: 'inline-block'}}>Organization:</span>
                  <span className='fw5 ml3'>
                    {`${selectedOrder.client.corporateName}`}
                  </span>
                </div>
                <div className='mb3'>
                  <span style={{minWidth: '90px', display: 'inline-block'}}>Phone:</span>
                  <span className='fw5 ml3'>
                    {`${selectedOrder.client.phone}`}
                  </span>
                </div>
              </div>
              <OrderProductsTable order={selectedOrder} stripe={stripe} isLoading={isLoading} />
              {
                !isLoading ?
                getTotals()
                : undefined
              }
            </>
            :
            undefined
          }
        </div>
      </div>
    </Modal>
  )
}

export default OrderDetailsModal
