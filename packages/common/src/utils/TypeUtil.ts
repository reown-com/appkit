export type CaipNetworkId = `${string}:${string}`

export type CaipAddress = `${string}:${string}:${string}`

export type ChainId = string | number

export type Chain = 'evm' | 'solana'

export type CaipNetwork = {
  id: CaipNetworkId
  chainId: ChainId
  chain: Chain
  name: string
  currency: string
  explorerUrl: string
  rpcUrl: string
  imageUrl?: string
  imageId?: string
}

export type CoinbaseTransactionStatus =
  | 'ONRAMP_TRANSACTION_STATUS_SUCCESS'
  | 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS'
  | 'ONRAMP_TRANSACTION_STATUS_FAILED'

export type TransactionStatus = 'confirmed' | 'failed' | 'pending'

export type TransactionDirection = 'in' | 'out' | 'self'

export type TransactionImage = {
  type: 'FUNGIBLE' | 'NFT' | undefined
  url: string | undefined
}

export interface Transaction {
  id: string
  metadata: TransactionMetadata
  transfers: TransactionTransfer[]
}

export interface TransactionMetadata {
  operationType: string
  hash: string
  chain: `${string}:${string}`
  minedAt: string
  sentFrom: string
  sentTo: string
  status: TransactionStatus | CoinbaseTransactionStatus
  nonce: number
}

export interface TransactionTransfer {
  fungible_info?: {
    name?: string
    symbol?: string
    icon?: {
      url: string
    }
  }
  nft_info?: TransactionNftInfo
  direction: TransactionDirection
  quantity: TransactionQuantity
  value?: number
  price?: number
}

export interface TransactionNftInfo {
  name?: string
  content?: TransactionContent
  flags: TransactionNftInfoFlags
}

export interface TransactionNftInfoFlags {
  is_spam: boolean
}

export interface TransactionContent {
  preview?: TransactionPreview
  detail?: TransactionDetail
}

export interface TransactionPreview {
  url: string
  content_type?: null
}

export interface TransactionDetail {
  url: string
  content_type?: null
}

export interface TransactionQuantity {
  numeric: string
}

export interface Balance {
  name: string
  symbol: string
  chainId: string
  address?: string
  value?: number
  price: number
  quantity: BalanceQuantity
  iconUrl: string
}

type BalanceQuantity = {
  decimals: string
  numeric: string
}
