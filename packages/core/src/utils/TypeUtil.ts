import type { W3mFrameProvider } from '@web3modal/wallet'
import type { Transaction } from '@web3modal/common'

export type CaipAddress = `${string}:${string}:${string}`

export type CaipNetworkId = `${string}:${string}`

export type CaipNetworkCoinbaseNetwork =
  | 'Ethereum'
  | 'Arbitrum One'
  | 'Polygon'
  | 'Avalanche'
  | 'OP Mainnet'
  | 'Celo'

export interface CaipNetwork {
  id: CaipNetworkId
  name?: string
  imageId?: string
  imageUrl?: string
}

export interface LinkingRecord {
  redirect: string
  href: string
}

export type ProjectId = string

export type Platform =
  | 'mobile'
  | 'desktop'
  | 'browser'
  | 'web'
  | 'qrcode'
  | 'unsupported'
  | 'external'

export type ConnectorType = 'EXTERNAL' | 'WALLET_CONNECT' | 'INJECTED' | 'ANNOUNCED' | 'EMAIL'

export type Connector = {
  id: string
  type: ConnectorType
  name?: string
  imageId?: string
  explorerId?: string
  imageUrl?: string
  info?: { rdns?: string }
  provider?: unknown
}

export interface EmailConnector extends Connector {
  provider: W3mFrameProvider
}

export type CaipNamespaces = Record<
  string,
  {
    chains: CaipNetworkId[]
    methods: string[]
    events: string[]
  }
>

export type SdkVersion =
  | `${'html' | 'react' | 'vue'}-wagmi-${string}`
  | `${'html' | 'react' | 'vue'}-ethers5-${string}`
  | `${'html' | 'react' | 'vue'}-ethers-${string}`
  | `${'html' | 'react' | 'vue'}-solana-${string}`

export interface BaseError {
  message?: string
}

export type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

// -- ApiController Types -------------------------------------------------------
export interface WcWallet {
  id: string
  name: string
  homepage?: string
  image_id?: string
  image_url?: string
  order?: number
  mobile_link?: string | null
  desktop_link?: string | null
  webapp_link?: string | null
  app_store?: string | null
  play_store?: string | null
  chrome_store?: string | null
  rdns?: string | null
  injected?:
    | {
        namespace?: string
        injected_id?: string
      }[]
    | null
}

export interface ApiGetWalletsRequest {
  page: number
  entries: number
  search?: string
  include?: string[]
  exclude?: string[]
}

export interface ApiGetWalletsResponse {
  data: WcWallet[]
  count: number
}

export interface ApiGetAnalyticsConfigResponse {
  isAnalyticsEnabled: boolean
}

export type ThemeMode = 'dark' | 'light'

export interface ThemeVariables {
  '--w3m-font-family'?: string
  '--w3m-accent'?: string
  '--w3m-color-mix'?: string
  '--w3m-color-mix-strength'?: number
  '--w3m-font-size-master'?: string
  '--w3m-border-radius-master'?: string
  '--w3m-z-index'?: number
}

// -- BlockchainApiController Types ---------------------------------------------
export interface BlockchainApiIdentityRequest {
  caipChainId: CaipNetworkId
  address: string
}

export interface BlockchainApiIdentityResponse {
  avatar: string | null
  name: string | null
}

export interface BlockchainApiTransactionsRequest {
  account: string
  projectId: string
  cursor?: string
  onramp?: 'coinbase'
  signal?: AbortSignal
}

export interface BlockchainApiTransactionsResponse {
  data: Transaction[]
  next: string | null
}

// -- OptionsController Types ---------------------------------------------------
export interface Token {
  address: string
  image?: string
}

export type Tokens = Record<CaipNetworkId, Token>

export type CustomWallet = Pick<
  WcWallet,
  | 'id'
  | 'name'
  | 'homepage'
  | 'image_url'
  | 'mobile_link'
  | 'desktop_link'
  | 'webapp_link'
  | 'app_store'
  | 'play_store'
>

// -- EventsController Types ----------------------------------------------------

export type Event =
  | {
      type: 'track'
      event: 'MODAL_CREATED'
    }
  | {
      type: 'track'
      event: 'MODAL_LOADED'
    }
  | {
      type: 'track'
      event: 'MODAL_OPEN'
      properties: {
        connected: boolean
      }
    }
  | {
      type: 'track'
      event: 'MODAL_CLOSE'
      properties: {
        connected: boolean
      }
    }
  | {
      type: 'track'
      event: 'CLICK_ALL_WALLETS'
    }
  | {
      type: 'track'
      event: 'SELECT_WALLET'
      properties: {
        name: string
        platform: Platform
      }
    }
  | {
      type: 'track'
      event: 'CONNECT_SUCCESS'
      properties: {
        method: 'qrcode' | 'mobile' | 'external' | 'browser' | 'email'
      }
    }
  | {
      type: 'track'
      event: 'CONNECT_ERROR'
      properties: {
        message: string
      }
    }
  | {
      type: 'track'
      event: 'DISCONNECT_SUCCESS'
    }
  | {
      type: 'track'
      event: 'DISCONNECT_ERROR'
    }
  | {
      type: 'track'
      event: 'CLICK_WALLET_HELP'
    }
  | {
      type: 'track'
      event: 'CLICK_NETWORK_HELP'
    }
  | {
      type: 'track'
      event: 'CLICK_GET_WALLET'
    }
  | {
      type: 'track'
      event: 'CLICK_TRANSACTIONS'
    }
  | {
      type: 'track'
      event: 'ERROR_FETCH_TRANSACTIONS'
      properties: {
        address: string
        projectId: string
        cursor: string | undefined
      }
    }
  | {
      type: 'track'
      event: 'LOAD_MORE_TRANSACTIONS'
      properties: {
        address: string | undefined
        projectId: string
        cursor: string | undefined
      }
    }
  | {
      type: 'track'
      event: 'CLICK_SIGN_SIWE_MESSAGE'
    }
  | {
      type: 'track'
      event: 'CLICK_CANCEL_SIWE'
    }
  | {
      type: 'track'
      event: 'CLICK_NETWORKS'
    }
  | {
      type: 'track'
      event: 'SIWE_AUTH_SUCCESS'
    }
  | {
      type: 'track'
      event: 'SIWE_AUTH_ERROR'
    }
  | {
      type: 'track'
      event: 'EMAIL_LOGIN_SELECTED'
    }
  | {
      type: 'track'
      event: 'EMAIL_SUBMITTED'
    }
  | {
      type: 'track'
      event: 'DEVICE_REGISTERED_FOR_EMAIL'
    }
  | {
      type: 'track'
      event: 'EMAIL_VERIFICATION_CODE_SENT'
    }
  | {
      type: 'track'
      event: 'EMAIL_VERIFICATION_CODE_PASS'
    }
  | {
      type: 'track'
      event: 'EMAIL_VERIFICATION_CODE_FAIL'
    }
  | {
      type: 'track'
      event: 'EMAIL_EDIT'
    }
  | {
      type: 'track'
      event: 'EMAIL_UPGRADE_FROM_MODAL'
    }
  | {
      type: 'track'
      event: 'SWITCH_NETWORK'
      properties: {
        network: string
      }
    }

// -- SIWEController Types ---------------------------------------------------

export interface SIWESession {
  address: string
  chainId: number
}

export interface SIWECreateMessageArgs {
  nonce: string
  address: string
  chainId: number
}

export interface SIWEVerifyMessageArgs {
  message: string
  signature: string
}

export interface SIWEClientMethods {
  getNonce: () => Promise<string>
  createMessage: (args: SIWECreateMessageArgs) => string
  verifyMessage: (args: SIWEVerifyMessageArgs) => Promise<boolean>
  getSession: () => Promise<SIWESession | null>
  signOut: () => Promise<boolean>
  onSignIn?: (session?: SIWESession) => void
  onSignOut?: () => void
}

export interface SIWEConfig extends SIWEClientMethods {
  // Defaults to true
  enabled?: boolean
  // In milliseconds, defaults to 5 minutes
  nonceRefetchIntervalMs?: number
  // In milliseconds, defaults to 5 minutes
  sessionRefetchIntervalMs?: number
  // Defaults to true
  signOutOnDisconnect?: boolean
  // Defaults to true
  signOutOnAccountChange?: boolean
  // Defaults to true
  signOutOnNetworkChange?: boolean
}

// Onramp Types
export type DestinationWallet = {
  address: string
  blockchains: string[]
  assets: string[]
}

export type GenerateOnRampUrlArgs = {
  destinationWallets: DestinationWallet[]
  partnerUserId: string
  defaultNetwork?: string
  purchaseAmount?: number
  paymentAmount?: number
}

export type CoinbaseNetwork = {
  name: string
  display_name: string
  chain_id: string
  contract_address: string
}

export type PaymentLimits = {
  id: string
  min: string
  max: string
}

export type PaymentCurrency = {
  id: string
  payment_method_limits: PaymentLimits[]
}

export type QuoteAmount = {
  amount: string
  currency: string
}

export type PurchaseCurrency = {
  id: string
  name: string
  symbol: string
  networks: CoinbaseNetwork[]
}

export type OnrampQuote = {
  paymentTotal: QuoteAmount
  paymentSubtotal: QuoteAmount
  purchaseAmount: QuoteAmount
  coinbaseFee: QuoteAmount
  networkFee: QuoteAmount
  quoteId: string
}

export type GetQuoteArgs = {
  purchaseCurrency: PurchaseCurrency
  paymentCurrency: PaymentCurrency
  amount: string
  network: string
}
