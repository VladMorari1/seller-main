export function arrayToObjectByProperty<
  T,
  K extends keyof T,
  R extends Record<T[K] extends string | number ? T[K] : never, T>
>(array: T[], property: K): R {
  return array.reduce((obj, item) => {
    const key = (item as Record<string, unknown>)[
      (property as unknown) as string
    ] as string

    ;(obj as Record<string, unknown>)[key] = item

    return obj
  }, <R>{})
}

export function zipPropertiesOfArrayToObject<
  T,
  K extends keyof T,
  V extends keyof T,
  R extends Record<T[K] extends string | number ? T[K] : never, T[V]>
>(array: T[], keyProperty: K, valueProperty: V): R {
  return array.reduce((obj, item) => {
    const key = (item as Record<string, unknown>)[
      (keyProperty as unknown) as string
    ]
    const value = (item as Record<string, unknown>)[
      (valueProperty as unknown) as string
    ]

    ;(obj as Record<string, unknown>)[key as string] = value

    return obj
  }, <R>{})
}

export function sum(array: number[]): number {
  return array.reduce((total, item) => total + item, 0)
}

export function getOrderId(id: string): string {
  const regex = /-(\d+)-/
  const match = regex.exec(id)
  return match?.length ? match[1] : ''
}
