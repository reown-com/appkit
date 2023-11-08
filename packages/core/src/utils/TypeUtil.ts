export type CaipAddress = `${string}:${string}:${string}`

export type CaipNetworkId = `${string}:${string}`

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

export type ConnectorType = 'EXTERNAL' | 'WALLET_CONNECT' | 'INJECTED' | 'ANNOUNCED'

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
  avatar: string
  name: string
}

export interface BlockchainApiTransactionsRequest {
  account: string
  projectId: string
  cursor: string | null
}

export interface BlockchainApiTransactionsResponse {
  data: Transaction[]
  next: string
}

export type TransactionStatus = 'confirmed' | 'failed' | 'pending'

export type TransactionDirection = 'in' | 'out' | 'self'

export interface Transaction {
  id: string
  metadata: TransactionMetadata
  transfers: TransactionTransfer[]
}

export interface TransactionMetadata {
  operationType: string
  hash: string
  minedAt: string
  sentFrom: string
  sentTo: string
  status: TransactionStatus
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
    }
  | {
      type: 'track'
      event: 'MODAL_CLOSE'
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
        method: 'qrcode' | 'mobile' | 'external' | 'browser'
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
      event: 'LOAD_MORE_TRANSACTIONS'
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
