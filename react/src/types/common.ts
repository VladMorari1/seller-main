import type { Warehouse } from './skuTypes'

export interface IFilterProps {
  value: any
  onChange: (val: any) => any
}

export type PreorderItemsEta = {
  year: number
  month: number
  partOfMonth: string
}

export interface IWarehouseFilterProps extends IFilterProps {
  warehouseList: Warehouse[]
}

export interface ICustomersFilterProps extends IFilterProps {
  customers: string[]
}

export type WarehousesObjectFilter = {
  label: string
  id: string
  checked: boolean
}

export interface IGlobalStatement {
  object: { [key: string]: WarehousesObjectFilter }
  subject: string
  verb: string
}

export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum SellerTabs {
  ORDERS = 'orders',
  PREORDERS = 'preorders',
  SKU = 'sku',
  TRANSFERS = 'transfers',
}
