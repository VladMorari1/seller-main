import type { EstimatedFulfillment } from '../types/skuTypes'

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const startOfDay = (date: Date): Date => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0
  )
}

export const endOfDay = (date: Date): Date => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  )
}

export const getFulfilmentTime = () => {
  const date = new Date()

  const fulfilmentTime: string[] = []

  months.forEach(() => {
    fulfilmentTime.push(
      `start ${months[date.getMonth()]} ${date.getFullYear()}`
    )
    fulfilmentTime.push(`mid ${months[date.getMonth()]} ${date.getFullYear()}`)
    fulfilmentTime.push(`end ${months[date.getMonth()]} ${date.getFullYear()}`)
    date.setMonth(date.getMonth() + 1)
  })

  return fulfilmentTime
}

export const getSkuFulfilment = (fulfilment?: {
  [key: string]: EstimatedFulfillment | null
}) => {
  if (fulfilment && Object.values(fulfilment)[0]) {
    const { partOfMonth, month, year } = Object.values(
      fulfilment
    )[0] as EstimatedFulfillment

    return `${partOfMonth} ${months[month - 1]} ${year}`
  }

  return null
}

export const convertToObjectFulfilment = (period: string) => {
  const [partOfMonth, month, year] = period.split(' ')

  return { month: months.indexOf(month) + 1, year: Number(year), partOfMonth }
}

export function formatDate(date: Date): string {
  const _months: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const day: string = date.getDate().toString().padStart(2, '0')
  const month: string = _months[date.getMonth()]
  const year: number = date.getFullYear()
  const hours: string = date.getHours().toString().padStart(2, '0')
  const minutes: string = date.getMinutes().toString().padStart(2, '0')

  return `${day} ${month} ${year} [${hours}:${minutes}]`
}
