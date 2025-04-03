import type { CaipNetworkId } from '@reown/appkit-common'

type Hex = `0x${string}`
type Address = Hex
export type AddressOrNative = Address | 'native'

type AssetMetadata = {
  name: string
  symbol: string
  decimals: number
}

type PaymentAsset = {
  network: CaipNetworkId
  recipient: string
  asset: AddressOrNative
  amount: number
  metadata: AssetMetadata
}

export type PaymentOptions = {
  paymentAsset: PaymentAsset
}
