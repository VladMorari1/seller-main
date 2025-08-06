export type Reservation = {
  LastUpdateDateUtc: string
  SalesChannel: string
  LockId: string
  ReservationDateUtc: string
  MaximumConfirmationDateUtc: string
  Status: number
  SlaRequest: [
    {
      item: {
        id: string
        groupItemId: unknown
        quantity: number
        price: number
        modal: boolean
        additionalHandlingTime: string
        dimension: {
          weight: number
          height: number
          width: number
          length: number
          maxSumDimension: number
        }
        kitItem: unknown[]
        unlimitedQuantity: boolean
        dockId: string
        warehouseId: string
        provider: unknown
      }
      slaType: string
      slaTypeName: string
      freightTableName: string
      freightTableId: string
      listPrice: number
      promotionalPrice: number
      timeToPresale: string
      transitTime: string
      dockTime: string
      timeToDockPlusDockTime: string
      totalTime: string
      deliveryWindows: boolean
      wareHouseId: string
      kitReservation: boolean
      dockId: string
      wmsEndPoint: string
      location: {
        zipCode: string
        country: string
        point: [number, number]
        inStore: {
          isCheckedIn: boolean
          storeId: boolean
        }
      }
      pickupStoreInfo: boolean
      deliveryOnWeekends: boolean
      weekendAndHolidays: {
        saturday: boolean
        sunday: boolean
        holiday: boolean
      }
      estimateDate: string
      deliveryChannel: string
      totalTimePlusCarrierSchedule: string
      polygonName: string
      distanceLevel: string
      accountCarrier: string
      dateOfSupplyUtc: boolean
      supplyLotId: string
      isExternal: boolean
    }
  ]
  CanceledDateUtc: string
  AuthorizedDateUtc: string
  ConfirmedDateUtc: string
  Errors: unknown[]
  IsSucess: boolean
}
