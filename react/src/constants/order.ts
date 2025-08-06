export const ORDER_STATUSES = [
  {
    id: 'order-created',
    name: 'Order created',
    type: 'green'
  },
  {
    id: 'order-accepted',
    name: 'Order accepted',
    type: 'green'
  },
  {
    id: 'cancel',
    name: 'Cancel',
    type: 'red'
  },
  {
    id: 'payment-approved',
    name: 'Payment approved',
    type: 'green'
  },
  {
    id: 'payment-pending',
    name: 'Payment pending',
    type: 'green'
  },
  {
    id: 'request-cancel',
    name: 'Cancellation requested',
    type: 'yellow'
  },
  {
    id: 'canceled',
    name: 'Canceled',
    type: 'red'
  },
  {
    id: 'window-to-change-payment',
    name: 'Window to change payment',
    type: 'green'
  },
  {
    id: 'waiting-for-authorization',
    name: 'Waiting for seller confirmation',
    type: 'green'
  },
  {
    id: 'waiting-for-fulfillment',
    name: 'Waiting for fulfillment',
    type: 'green'
  },
  {
    id: 'waiting-ffmt-authorization',
    name: 'Waiting fulfillment authorization',
    type: 'green'
  },
  {
    id: 'waiting-for-manual-authorization',
    name: 'Waiting for fulfillment authorization',
    type: 'green'
  },
  {
    id: 'authorize-fulfillment',
    name: 'Authorize fulfillment',
    type: 'green'
  },
  {
    id: 'window-to-cancel',
    name: 'Cancellation window',
    type: 'green'
  },
  {
    id: 'ready-for-invoicing',
    name: 'Ready for invoicing',
    type: 'green'
  },
  {
    id: 'invoice',
    name: 'Verifying invoice',
    type: 'green'
  },
  {
    id: 'invoiced',
    name: 'Invoiced',
    type: 'green'
  },
  {
    id: 'ready-for-handling',
    name: 'Ready for handling',
    type: 'green'
  },
  {
    id: 'start-handling',
    name: 'Start handling',
    type: 'green'
  },
  {
    id: 'cancellation-requested',
    name: 'Cancellation requested',
    type: 'red'
  },
  {
    id: 'waiting-seller-handling',
    name: 'Waiting for seller handling',
    type: 'green'
  },
  {
    id: 'handling',
    name: 'Handling shipping',
    type: 'green'
  },
]

export const FILTER_CREATED_AT = [
  {
    label: 'Today',
    value: '0',
  },
  {
    label: 'Yesterday',
    value: '1', // value: new Date(new Date().setDate(date.getDate() - 1)).toISOString(),
  },
  {
    label: 'Last 7 days',
    value: '7',
  },
  {
    label: 'Last 30 days',
    value: '30',
  },
  {
    label: 'Last year',
    value: '365',
  },
]
