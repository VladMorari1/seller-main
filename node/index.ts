import type { ClientsConfig } from '@vtex/api'
import { LRUCache, Service, method } from '@vtex/api'

import { Clients } from './clients'
import {
  fulfillPreOrderItems,
  cancelPreOrderItems,
  getPreOrders,
  getPreOrderTotals,
  getPreOrderFilters,
  getSellerPercentage,
  setSellerPercentage,
  notifyUserByMail,
  checkMissingPreOrders,
} from './services/pre-orders/pre-orders.handler'
import {
  fulfillStock,
  getSkuFilters,
  getSkus,
  getSkuTotals,
  updateSkuCount,
  updateSkuPreOrderAvailable,
} from './services/skus/skus.handler'
import { orderCreatedBroadcastHandler } from './events/order-created.handler'
import { buildErrorHandler } from './middlewares/error.middleware'
import { getTransfersInfo } from './services/transfers/transfers.handler'
import { getAllOrders } from './services/orders/orders.handler'
import { getStripe } from './services/stripes/stripes.handler'
import { unhealthyServiceCheck } from './middlewares/unhealthyService.middleware'
import { pong } from './middlewares/ping'

const TIMEOUT_MS = 1000 * 10

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('status', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    // This key will be merged with the default options and add this cache to our Status client.
    status: {
      memoryCache,
    },
  },
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  events: {
    orderCreated: orderCreatedBroadcastHandler,
  },
  routes: {
    orders: method({
      GET: [buildErrorHandler(getAllOrders)],
    }),
    stripe: method({
      GET: [buildErrorHandler(getStripe)],
    }),
    preOrders: method({
      GET: [buildErrorHandler(getPreOrders)],
    }),
    checkMissingPreOrders: method({
      POST: [buildErrorHandler(checkMissingPreOrders)],
    }),
    fulfillPreOrder: method({
      POST: [buildErrorHandler(fulfillPreOrderItems)],
    }),
    cancelPreOrder: method({
      POST: [buildErrorHandler(cancelPreOrderItems)],
    }),
    preOrderTotals: method({
      GET: [buildErrorHandler(getPreOrderTotals)],
    }),
    preOrderFilters: method({
      GET: [buildErrorHandler(getPreOrderFilters)],
    }),
    skus: method({
      POST: [buildErrorHandler(getSkus)],
    }),
    updateSkus: method({
      POST: [buildErrorHandler(updateSkuCount)],
    }),
    skuFilters: method({
      GET: [buildErrorHandler(getSkuFilters)],
    }),
    skusPreOrder: method({
      POST: [buildErrorHandler(updateSkuPreOrderAvailable)],
    }),
    skusTotals: method({
      GET: [buildErrorHandler(getSkuTotals)],
    }),
    skuFulfill: method({
      POST: [buildErrorHandler(fulfillStock)],
    }),
    sellersPercentage: method({
      GET: [buildErrorHandler(getSellerPercentage)],
    }),
    sellerPercentage: method({
      POST: [buildErrorHandler(setSellerPercentage)],
    }),
    userNotify: method({
      POST: [buildErrorHandler(notifyUserByMail)],
    }),
    getTransfersInfo: method({
      GET: [buildErrorHandler(getTransfersInfo)],
    }),
    unhealthyserviceCheck: method({
      GET: [buildErrorHandler(unhealthyServiceCheck)],
    }),
    ping: method({
      GET: [pong]
    })
  },
})
