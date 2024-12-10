import type { W3mFrameProvider, W3mFrameTypes } from '@reown/appkit-wallet'
import type {
  Balance,
  Transaction,
  CaipNetworkId,
  CaipNetwork,
  ChainNamespace,
  CaipAddress,
  AdapterType,
  SdkFramework,
  AppKitSdkVersion,
  AppKitNetwork
} from '@reown/appkit-common'
import type { ConnectionControllerClient } from '../controllers/ConnectionController.js'
import type { AccountControllerState } from '../controllers/AccountController.js'
import type { OnRampProviderOption } from '../controllers/OnRampController.js'
import type { ConstantsUtil } from './ConstantsUtil.js'
import type { ReownName } from '../controllers/EnsController.js'
import type UniversalProvider from '@walletconnect/universal-provider'

type InitializeAppKitConfigs = {
  showWallets?: boolean
  siweConfig?: {
    options: {
      enabled?: boolean
      nonceRefetchIntervalMs?: number
      sessionRefetchIntervalMs?: number
      signOutOnDisconnect?: boolean
      signOutOnAccountChange?: boolean
      signOutOnNetworkChange?: boolean
    }
  }
  themeMode?: 'dark' | 'light'
  themeVariables?: ThemeVariables
  allowUnsupportedChain?: boolean
  networks: (string | number)[]
  defaultNetwork?: AppKitNetwork
  chainImages?: Record<number | string, string>
  connectorImages?: Record<string, string>
  coinbasePreference?: 'all' | 'smartWalletOnly' | 'eoaOnly'
  metadata?: Metadata
}

export type CaipNetworkCoinbaseNetwork =
  | 'Ethereum'
  | 'Arbitrum One'
  | 'Polygon'
  | 'Avalanche'
  | 'OP Mainnet'
  | 'Celo'

export type ConnectedWalletInfo =
  | {
      name?: string
      icon?: string
      [key: string]: unknown
    }
  | undefined

export interface LinkingRecord {
  redirect: string
  href: string
}

export type ProjectId = string

export type Platform = 'mobile' | 'desktop' | 'browser' | 'web' | 'qrcode' | 'unsupported'

export type ConnectorType =
  | 'EXTERNAL'
  | 'WALLET_CONNECT'
  | 'INJECTED'
  | 'ANNOUNCED'
  | 'AUTH'
  | 'MULTI_CHAIN'
  | 'ID_AUTH'

export type SocialProvider =
  | 'google'
  | 'github'
  | 'apple'
  | 'facebook'
  | 'x'
  | 'discord'
  | 'farcaster'

export type Connector = {
  id: string
  type: ConnectorType
  name?: string
  imageId?: string
  explorerId?: string
  imageUrl?: string
  info?: {
    uuid?: string
    name?: string
    icon?: string
    rdns?: string
  }
  provider?: Provider | W3mFrameProvider | UniversalProvider
  chain: ChainNamespace
  connectors?: Connector[]
}

export interface AuthConnector extends Connector {
  provider: W3mFrameProvider
  socials?: SocialProvider[]
  email?: boolean
}

export type CaipNamespaces = Record<
  string,
  {
    chains: CaipNetworkId[]
    methods: string[]
    events: string[]
  }
>

export type SdkVersion = `${SdkFramework}-${AdapterType}-${string}` | AppKitSdkVersion

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
  badge_type?: BadgeType
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
  chains: string
  entries: number
  search?: string
  badge?: BadgeType
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
  '--w3m-qr-color'?: string
}

// -- BlockchainApiController Types ---------------------------------------------
export interface BlockchainApiIdentityRequest {
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
  projectId: string
  chainId?: string
}

export interface BlockchainApiSwapTokensResponse {
  tokens: SwapToken[]
}

export interface BlockchainApiSwapQuoteRequest {
  projectId: string
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
  projectId: string
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
  projectId: string
  tokenAddress: string
  userAddress: string
}

export interface BlockchainApiSwapAllowanceResponse {
  allowance: string
}

export interface BlockchainApiGasPriceRequest {
  projectId: string
  chainId: string
}

export interface BlockchainApiGasPriceResponse {
  standard: string
  fast: string
  instant: string
}

export interface BlockchainApiGenerateSwapCalldataRequest {
  projectId: string
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
  projectId: string
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
        method: 'qrcode' | 'mobile' | 'browser' | 'email'
        name: string
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
      properties: {
        isSmartAccount: boolean
      }
    }
  | {
      type: 'track'
      event: 'ERROR_FETCH_TRANSACTIONS'
      properties: {
        address: string
        projectId: string
        cursor: string | undefined
        isSmartAccount: boolean
      }
    }
  | {
      type: 'track'
      event: 'LOAD_MORE_TRANSACTIONS'
      properties: {
        address: string | undefined
        projectId: string
        cursor: string | undefined
        isSmartAccount: boolean
      }
    }
  | {
      type: 'track'
      event: 'CLICK_SIGN_SIWX_MESSAGE'
      properties: {
        network: string
        isSmartAccount: boolean
      }
    }
  | {
      type: 'track'
      event: 'CLICK_CANCEL_SIWX'
      properties: {
        network: string
        isSmartAccount: boolean
      }
    }
  | {
      type: 'track'
      event: 'CLICK_NETWORKS'
    }
  | {
      type: 'track'
      event: 'SIWX_AUTH_SUCCESS'
      properties: {
        network: string
        isSmartAccount: boolean
      }
    }
  | {
      type: 'track'
      event: 'SIWX_AUTH_ERROR'
      properties: {
        network: string
        isSmartAccount: boolean
      }
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
      properties: {
        message: string
      }
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
  | {
      type: 'track'
      event: 'CLICK_CONVERT'
    }
  | {
      type: 'track'
      event: 'CLICK_SELECT_TOKEN_TO_SWAP'
    }
  | {
      type: 'track'
      event: 'CLICK_SELECT_NETWORK_TO_SWAP'
    }
  | {
      type: 'track'
      event: 'SELECT_BUY_CRYPTO'
      properties: {
        isSmartAccount: boolean
      }
    }
  | {
      type: 'track'
      event: 'SELECT_BUY_PROVIDER'
      properties: {
        provider: OnRampProviderOption
        isSmartAccount: boolean
      }
    }
  | {
      type: 'track'
      event: 'SELECT_WHAT_IS_A_BUY'
      properties: {
        isSmartAccount: boolean
      }
    }
  | {
      type: 'track'
      event: 'SET_PREFERRED_ACCOUNT_TYPE'
      properties: {
        accountType: W3mFrameTypes.AccountType
        network: string
      }
    }
  | {
      type: 'track'
      event: 'OPEN_SWAP'
      properties: {
        isSmartAccount: boolean
        network: string
      }
    }
  | {
      type: 'track'
      event: 'INITIATE_SWAP'
      properties: {
        isSmartAccount: boolean
        network: string
        swapFromToken: string
        swapToToken: string
        swapFromAmount: string
        swapToAmount: string
      }
    }
  | {
      type: 'track'
      event: 'SWAP_SUCCESS'
      properties: {
        isSmartAccount: boolean
        network: string
        swapFromToken: string
        swapToToken: string
        swapFromAmount: string
        swapToAmount: string
      }
    }
  | {
      type: 'track'
      event: 'SWAP_ERROR'
      properties: {
        isSmartAccount: boolean
        network: string
        swapFromToken: string
        swapToToken: string
        swapFromAmount: string
        swapToAmount: string
        message: string
      }
    }
  | {
      type: 'track'
      event: 'SWAP_APPROVAL_ERROR'
      properties: {
        isSmartAccount: boolean
        network: string
        swapFromToken: string
        swapToToken: string
        swapFromAmount: string
        swapToAmount: string
        message: string
      }
    }
  | {
      type: 'track'
      event: 'SOCIAL_LOGIN_STARTED'
      properties: {
        provider: SocialProvider
      }
    }
  | {
      type: 'track'
      event: 'SOCIAL_LOGIN_SUCCESS'
      properties: {
        provider: SocialProvider
      }
    }
  | {
      type: 'track'
      event: 'SOCIAL_LOGIN_ERROR'
      properties: {
        provider: SocialProvider
      }
    }
  | {
      type: 'track'
      event: 'SOCIAL_LOGIN_REQUEST_USER_DATA'
      properties: {
        provider: SocialProvider
      }
    }
  | {
      type: 'track'
      event: 'SOCIAL_LOGIN_CANCELED'
      properties: {
        provider: SocialProvider
      }
    }
  | {
      type: 'track'
      event: 'OPEN_ENS_FLOW'
      properties: {
        isSmartAccount: boolean
      }
    }
  | {
      type: 'track'
      event: 'REGISTER_NAME_INITIATED'
      properties: {
        isSmartAccount: boolean
        ensName: string
      }
    }
  | {
      type: 'track'
      event: 'REGISTER_NAME_SUCCESS'
      properties: {
        isSmartAccount: boolean
        ensName: string
      }
    }
  | {
      type: 'track'
      event: 'REGISTER_NAME_ERROR'
      properties: {
        isSmartAccount: boolean
        ensName: string
        error: string
      }
    }
  | {
      type: 'track'
      event: 'OPEN_SEND'
      properties: {
        isSmartAccount: boolean
        network: string
      }
    }
  | {
      type: 'track'
      event: 'SEND_INITIATED'
      properties: {
        isSmartAccount: boolean
        network: string
        token: string
        amount: number
      }
    }
  | {
      type: 'track'
      event: 'SEND_SUCCESS'
      properties: {
        isSmartAccount: boolean
        network: string
        token: string
        amount: number
      }
    }
  | {
      type: 'track'
      event: 'SEND_ERROR'
      properties: {
        isSmartAccount: boolean
        network: string
        token: string
        amount: number
      }
    }
  | {
      type: 'track'
      event: 'CONNECT_PROXY_ERROR'
      properties: {
        message: string
        uri: string
        mobile_link: string
        name: string
      }
    }
  | {
      type: 'track'
      event: 'SEARCH_WALLET'
      properties: {
        badge: string
        search: string
      }
    }
  | {
      type: 'track'
      event: 'INITIALIZE'
      properties: InitializeAppKitConfigs
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

export type NamespaceTypeMap = {
  eip155: 'eoa' | 'smartAccount'
  solana: 'eoa'
  bip122: 'payment' | 'ordinal' | 'stx'
  polkadot: 'eoa'
}

export type AccountTypeMap = {
  [K in ChainNamespace]: {
    namespace: K
    address: string
    type: NamespaceTypeMap[K]
  }
}

export type AccountType = AccountTypeMap[ChainNamespace]
export type SendTransactionArgs =
  | {
      chainNamespace?: undefined | 'eip155'
      to: `0x${string}`
      data: `0x${string}`
      value: bigint
      gas?: bigint
      gasPrice: bigint
      address: `0x${string}`
    }
  | { chainNamespace: 'solana'; to: string; value: number }

export type EstimateGasTransactionArgs =
  | {
      chainNamespace?: undefined | 'eip155'
      address: `0x${string}`
      to: `0x${string}`
      data: `0x${string}`
    }
  | {
      chainNamespace: 'solana'
    }

export interface WriteContractArgs {
  receiverAddress: `0x${string}`
  tokenAmount: bigint
  tokenAddress: `0x${string}`
  fromAddress: `0x${string}`
  method: 'send' | 'transfer' | 'call'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abi: any
}

export interface NetworkControllerClient {
  switchCaipNetwork: (network: CaipNetwork) => Promise<void>
  getApprovedCaipNetworksData: () => Promise<{
    approvedCaipNetworkIds: CaipNetworkId[]
    supportsAllNetworks: boolean
  }>
}

export type AdapterNetworkState = {
  supportsAllNetworks: boolean
  isUnsupportedChain?: boolean
  _client?: NetworkControllerClient
  caipNetwork?: CaipNetwork
  requestedCaipNetworks?: CaipNetwork[]
  approvedCaipNetworkIds?: CaipNetworkId[]
  allowUnsupportedCaipNetwork?: boolean
  smartAccountEnabledNetworks?: number[]
}

export type AdapterAccountState = {
  currentTab: number
  caipAddress?: CaipAddress
  address?: string
  addressLabels: Map<string, string>
  allAccounts: AccountType[]
  balance?: string
  balanceSymbol?: string
  profileName?: string | null
  profileImage?: string | null
  addressExplorerUrl?: string
  smartAccountDeployed?: boolean
  socialProvider?: SocialProvider
  tokenBalance?: Balance[]
  shouldUpdateToAddress?: string
  connectedWalletInfo?: ConnectedWalletInfo
  preferredAccountType?: W3mFrameTypes.AccountType
  socialWindow?: Window
  farcasterUrl?: string
  status?: 'reconnecting' | 'connected' | 'disconnected' | 'connecting'
}

export type ChainAdapter = {
  connectionControllerClient?: ConnectionControllerClient
  networkControllerClient?: NetworkControllerClient
  accountState?: AdapterAccountState
  networkState?: AdapterNetworkState
  namespace?: ChainNamespace
  caipNetworks?: CaipNetwork[] | AppKitNetwork[]
  projectId?: string
  adapterType?: string
}

export type ProviderEventListener = {
  connect: (connectParams: { chainId: number }) => void
  disconnect: (error: Error) => void
  display_uri: (uri: string) => void
  chainChanged: (chainId: string) => void
  accountsChanged: (accounts: string[]) => void
  message: (message: { type: string; data: unknown }) => void
}

export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface Provider {
  connect: (params?: { onUri?: (uri: string) => void }) => Promise<string>
  disconnect: () => Promise<void>
  request: <T>(args: RequestArguments) => Promise<T>
  on<T extends keyof ProviderEventListener>(event: T, listener: ProviderEventListener[T]): void
  removeListener: <T>(event: string, listener: (data: T) => void) => void
  emit: (event: string, data?: unknown) => void
}

export type CombinedProvider = W3mFrameProvider & Provider

export type CoinbasePaySDKChainNameValues =
  keyof typeof ConstantsUtil.WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP

export type WalletFeature = 'swaps' | 'send' | 'receive' | 'onramp'

export type ConnectMethod = 'email' | 'social' | 'wallet'

export type Features = {
  /**
   * @description Enable or disable the swaps feature. Enabled by default.
   * @type {boolean}
   */
  swaps?: boolean
  /**
   * @description Enable or disable the onramp feature. Enabled by default.
   * @type {boolean}
   */
  onramp?: boolean
  /**
   * @description Enable or disable the receive feature. Enabled by default.
   * This feature is only visible when connected with email/social. It's not possible to configure when connected with wallet, which is enabled by default.
   * @type {boolean}
   */
  receive?: boolean
  /**
   * @description Enable or disable the send feature. Enabled by default.
   * @type {boolean}
   */
  send?: boolean
  /**
   * @description Enable or disable the email feature. Enabled by default.
   * @type {boolean}
   */
  email?: boolean
  /**
   * @description Show or hide the regular wallet options when email is enabled. Enabled by default.
   * @deprecated - This property will be removed in the next major release. Please use `features.collapseWallets` instead.
   * @type {boolean}
   */
  emailShowWallets?: boolean
  /**
   * @description Enable or disable the socials feature. Enabled by default.
   * @type {SocialProvider[]}
   */
  socials?: SocialProvider[] | false
  /**
   * @description Enable or disable the history feature. Enabled by default.
   * @type {boolean}
   */
  history?: boolean
  /**
   * @description Enable or disable the analytics feature. Enabled by default.
   * @type {boolean}
   */
  analytics?: boolean
  /**
   * @description Enable or disable the all wallets feature. Enabled by default.
   * @type {boolean}
   */
  allWallets?: boolean
  /**
   * @description Enable or disable the Smart Sessions feature. Disabled by default.
   * @type {boolean}
   */
  smartSessions?: boolean
  /**
   * Enable or disable the terms of service and/or privacy policy checkbox.
   * @default false
   */
  legalCheckbox?: boolean
  /**
   * @description The order of the connect methods. This is experimental and subject to change.
   * @default ['email', 'social', 'wallet']
   * @type {('email' | 'social' | 'wallet')[]}
   */
  connectMethodsOrder?: ConnectMethod[]
  /**
   * @
   * @description The order of the wallet features. This is experimental and subject to change.
   * @default ['receive' | 'onramp' | 'swaps' | 'send']
   * @type {('receive' | 'onramp' | 'swaps' | 'send')[]}
   */
  walletFeaturesOrder?: WalletFeature[]
  /**
   * @description Enable or disable the collapse wallets as a single "Continue with wallet" button for simple UI in connect page.
   * This can be activated when only have another connect method like email or social activated along with wallets.
   * @default false
   */
  collapseWallets?: boolean
}

export type FeaturesKeys = keyof Features

export type WalletGuideType = 'get-started' | 'explore'

export type UseAppKitAccountReturn = {
  caipAddress: CaipAddress | undefined
  address: string | undefined
  isConnected: boolean
  status: AccountControllerState['status']
}

export type UseAppKitNetworkReturn = {
  caipNetwork: CaipNetwork | undefined
  chainId: number | string | undefined
  caipNetworkId: CaipNetworkId | undefined
  switchNetwork: (network: AppKitNetwork) => void
}

export type BadgeType = 'none' | 'certified'

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting'
