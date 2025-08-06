export function copyProperties<T, K extends keyof T>(
  source: T,
  ...properties: K[]
): Pick<T, K> {
  return properties.reduce((obj, key) => {
    obj[key] = source[key]

    return obj
  }, <Pick<T, K>>{})
}

export function dropProperties<T, K extends keyof T>(
  source: T,
  ...properties: K[]
): Omit<T, K> {
  return Object.keys(source).reduce((obj: T, key) => {
    if (!properties.includes(key as K)) {
      obj[key as K] = source[key as K]
    }

    return obj
  }, <T>{})
}
