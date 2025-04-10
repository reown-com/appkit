import type { CaipNetworkId } from '@reown/appkit-common'

type Hex = `0x${string}`
type Address = Hex
export type AddressOrNative = Address | 'native'

export type AssetMetadata = {
  name: string
  symbol: string
  decimals: number
}

export type PaymentAsset = {
  network: CaipNetworkId
  recipient: string
  asset: AddressOrNative
  amount: number
  metadata: AssetMetadata
}

export type PaymentOptions = {
  paymentAsset: PaymentAsset
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
