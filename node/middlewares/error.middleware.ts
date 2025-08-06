import { ServiceContext } from '@vtex/api'
import type { AxiosError } from 'axios'

import { Clients } from '../types'

export const buildErrorHandler = (
  routeHandler: (context: ServiceContext<Clients>) => unknown
) =>
  async function handleErrors(
    context: ServiceContext<Clients>,
    next: () => Promise<unknown>
  ): Promise<void> {
    context.set('cache-control', 'no-cache')
    context.status = 200

    try {
      const result = await routeHandler(context)

      context.body = JSON.stringify(result)
    } catch (e) {
      context.status = 400

      if (e.isAxiosError) {
        const axiosError = e as AxiosError

        context.body = axiosError.response?.data ?? axiosError.toString()
      } else {
        context.body = e.toString()
      }
    }

    await next()
  }
