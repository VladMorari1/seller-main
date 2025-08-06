import { IOClients } from '@vtex/api'
import { Catalog, OMS } from '@vtex/clients'

import PreOrdersClient from './pre-orders.client'
import SkuWaresClient from './sku-wares.client'
import LogisticsClient from './logistics.client'
import PaymentsClient from './payments.client'
import MarketplaceClient from './marketplace.client'
import SellerTokenClient from './seller-token.client'
import SellerPercentageClient from './seller-percentage.client'
import TransfersClient from './transfers.client'
import OrderClient from './order.client'

export class Clients extends IOClients {
  public get preOrdersApi(): PreOrdersClient {
    return this.getOrSet('preOrdersAPI', PreOrdersClient)
  }

  public get paymentApi(): PaymentsClient {
    return this.getOrSet('paymentApi', PaymentsClient)
  }

  public get marketplaceApi(): MarketplaceClient {
    return this.getOrSet('marketplaceApi', MarketplaceClient)
  }

  public get skuWaresApi(): SkuWaresClient {
    return this.getOrSet('skuWaresAPI', SkuWaresClient)
  }

  public get omsApi(): OMS {
    return this.getOrSet('omsAPI', OMS)
  }

  public get logisticsApi(): LogisticsClient {
    return this.getOrSet('logisticsAPI', LogisticsClient)
  }

  public get catalogApi(): Catalog {
    return this.getOrSet('catalogAPI', Catalog)
  }

  public get tokensApi(): SellerTokenClient {
    return this.getOrSet('tokensApi', SellerTokenClient)
  }

  public get sellerPercentageApi(): SellerPercentageClient {
    return this.getOrSet('sellerPercentageApi', SellerPercentageClient)
  }

  public get transfersApi(): TransfersClient {
    return this.getOrSet('transfersApi', TransfersClient)
  }

  public get orderApi() {
    return this.getOrSet('orderApi', OrderClient)
  }
}
