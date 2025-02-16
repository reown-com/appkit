type Hex = `0x${string}`

interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
}

export interface Asset {
  address: Hex | 'native'
  balance: Hex
  type: string
  metadata: TokenMetadata
}

export interface WalletGetAssetsRPCResponse {
  jsonrpc: string
  id: number
  result: Record<Hex, Asset[]>[]
}

export type WalletGetAssetsRPCRequest = {
  account: string
  chainFilter?: Hex[]
  assetFilter?: Record<Hex, (Hex | 'native')[]>
  assetTypeFilter?: ('NATIVE' | 'ERC20')[]
}
