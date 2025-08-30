import type { CaipNetworkId } from '@reown/appkit-common'

export type AssetMetadata = {
  name: string
  symbol: string
  decimals: number
}

export type PaymentAsset = {
  network: CaipNetworkId
  asset: string
  metadata: AssetMetadata
}

export type PaymentOptions = {
  paymentAsset: PaymentAsset
  recipient: string
  amount: number
  openInNewTab?: boolean
  redirectUrl?: {
    success: string
    failure: string
  }
  payWithExchange?: {
    includeOnly?: string[]
    exclude?: string[]
  }
}

export type GetExchangesParams = {
  page?: number
  asset?: string
  amount?: number | string
  network?: CaipNetworkId
}

export type PayUrlParams = {
  network: CaipNetworkId
  asset: string
  amount: number | string
  recipient: string
}

export type PayUrlResponse = {
  url: string
  sessionId: string
}
