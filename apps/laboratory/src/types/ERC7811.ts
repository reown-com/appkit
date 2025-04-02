type Hex = `0x${string}`

interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
  value?: number
  price: number
  iconUrl: string
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type AssetType = 'native' | 'erc20' | 'erc721' | string
export type AddressOrNative = `0x${string}` | 'native'
export type Asset = {
  address: AddressOrNative
  balance: `0x${string}`
  type: AssetType
  metadata: TokenMetadata
}

export interface WalletGetAssetsRPCResponse {
  jsonrpc: string
  id: number
  result: Record<Hex, Asset[]>
}

export type WalletGetAssetsParams = {
  account: `0x${string}`
  assetFilter?: Record<`0x${string}`, AddressOrNative[]>
  assetTypeFilter?: AssetType[]
  chainFilter?: `0x${string}`[]
}

export type WalletGetAssetsResponse = Record<`0x${string}`, Asset[]>
