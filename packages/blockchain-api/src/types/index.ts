import type { Balance, CaipAddress, SdkVersion, Transaction } from '@reown/appkit-common'

// -- Config ------------------------------------------------- //
export interface BlockchainApiClientConfig {
  baseUrl: string
  clientId?: string | null
  projectId?: string
  sdkType?: string
  sdkVersion?: SdkVersion
}

export interface RequestArgs {
  path: string
  headers?: HeadersInit
  params?: Record<string, string | undefined>
  cache?: RequestCache
  signal?: AbortSignal
}

export interface PostRequestArgs extends RequestArgs {
  body?: Record<string, unknown>
}

// -- Generic Types ----------------------------------------- //
export interface BaseError {
  message?: string
}

export type ReownName = `${string}.reown.id` | `${string}.wcn.id`

export interface BlockchainApiIdentityRequest {
  address: string
}

export interface BlockchainApiIdentityResponse {
  avatar: string | null
  name: string | null
}

export interface BlockchainApiTransactionsRequest {
  account: string
  cursor?: string
  onramp?: 'coinbase'
  signal?: AbortSignal
  cache?: RequestCache
  chainId?: string
}

export interface BlockchainApiTransactionsResponse {
  data: Transaction[]
  next: string | null
}

export type SwapToken = {
  name: string
  symbol: string
  address: CaipAddress
  decimals: number
  logoUri: string
  eip2612?: boolean
}

export type SwapTokenWithBalance = SwapToken & {
  quantity: {
    decimals: string
    numeric: string
  }
  price: number
  value: number
}

export interface BlockchainApiSwapTokensRequest {
  chainId?: string
}

export interface BlockchainApiSwapTokensResponse {
  tokens: SwapToken[]
}

export interface BlockchainApiSwapQuoteRequest {
  chainId?: string
  amount: string
  userAddress: string
  from: string
  to: string
  gasPrice: string
}

export interface BlockchainApiSwapQuoteResponse {
  quotes: {
    id: string | null
    fromAmount: string
    fromAccount: string
    toAmount: string
    toAccount: string
  }[]
}

export interface BlockchainApiTokenPriceRequest {
  currency?: 'usd' | 'eur' | 'gbp' | 'aud' | 'cad' | 'inr' | 'jpy' | 'btc' | 'eth'
  addresses: string[]
}

export interface BlockchainApiTokenPriceResponse {
  fungibles: {
    name: string
    symbol: string
    iconUrl: string
    price: number
  }[]
}

export interface BlockchainApiSwapAllowanceRequest {
  tokenAddress: string
  userAddress: string
}

export interface BlockchainApiSwapAllowanceResponse {
  allowance: string
}

export interface BlockchainApiGasPriceRequest {
  chainId: string
}

export interface BlockchainApiGasPriceResponse {
  standard: string
  fast: string
  instant: string
}

export interface BlockchainApiGenerateSwapCalldataRequest {
  userAddress: string
  from: string
  to: string
  amount: string
  eip155?: {
    slippage: string
    permit?: string
  }
}

export interface BlockchainApiGenerateSwapCalldataResponse {
  tx: {
    from: CaipAddress
    to: CaipAddress
    data: `0x${string}`
    amount: string
    eip155: {
      gas: string
      gasPrice: string
    }
  }
}

export interface BlockchainApiGenerateApproveCalldataRequest {
  userAddress: string
  from: string
  to: string
  amount?: number
}

export interface BlockchainApiGenerateApproveCalldataResponse {
  tx: {
    from: CaipAddress
    to: CaipAddress
    data: `0x${string}`
    value: string
    eip155: {
      gas: number
      gasPrice: string
    }
  }
}

export interface BlockchainApiBalanceResponse {
  balances: Balance[]
}

export interface BlockchainApiLookupEnsName {
  name: ReownName
  registered: number
  updated: number
  addresses: Record<
    string,
    {
      address: string
      created: string
    }
  >
  attributes: {
    avatar?: string
    bio?: string
  }[]
}

export interface BlockchainApiRegisterNameParams {
  coinType: number
  message: string
  signature: string
  address: `0x${string}`
}

export interface BlockchainApiSuggestionResponse {
  suggestions: {
    name: string
    registered: boolean
  }[]
}

export interface BlockchainApiEnsError extends BaseError {
  status: string
  reasons: { name: string; description: string }[]
}

// -- Params ------------------------------------------------- //
export type DestinationWallet = {
  address: string
  blockchains: string[]
  assets: string[]
}

export interface GenerateOnRampUrlArgs {
  destinationWallets: DestinationWallet[]
  partnerUserId: string
  defaultNetwork?: string
  purchaseAmount?: number
  paymentAmount?: number
}

export interface PaymentCurrency {
  id: string
  payment_method_limits: Array<{
    id: string
    min: string
    max: string
  }>
}

export interface PurchaseCurrency {
  id: string
  name: string
  symbol: string
  networks: Array<{
    name: string
    display_name: string
    chain_id: string
    contract_address: string
  }>
}

export interface GetQuoteArgs {
  purchaseCurrency: {
    id: string
    symbol: string
  }
  paymentCurrency: {
    id: string
  }
  amount: string
  network: string
}

export interface OnrampQuote {
  coinbaseFee: { amount: string; currency: string }
  networkFee: { amount: string; currency: string }
  paymentSubtotal: { amount: string; currency: string }
  paymentTotal: { amount: string; currency: string }
  purchaseAmount: { amount: string; currency: string }
  quoteId: string
}

export interface SmartSessionResponse {
  pcis: {
    name: string
    duration: number
    expiry: number
    pci: string
    account: CaipAddress
    dapp: {
      name: string
      url: string
      icon: string
      lastActivity: number
    }
  }[]
}
