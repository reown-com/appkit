import type { EthereumOptions, Web3ModalEthereum } from '@web3modal/ethereum'
import type { Web3ModalSolana } from '@web3modal/solana'

// -- ConfigCtrl ------------------------------------------- //
export interface ConfigOptions {
  projectId: string
  theme?: 'dark' | 'light'
  accentColor?:
    | 'blackWhite'
    | 'blue'
    | 'default'
    | 'green'
    | 'magenta'
    | 'orange'
    | 'purple'
    | 'teal'
  ethereum?: EthereumOptions
}

export interface ConfigCtrlState extends ConfigOptions {
  configured: boolean
}

// -- ConnectModalCtrl --------------------------------------- //
export interface ConnectModalCtrlState {
  open: boolean
}

// -- ExplorerCtrl ------------------------------------------- //
export interface ExplorerCtrlState {
  wallets: ListingResponse & { page: number }
  search: ListingResponse & { page: number }
  previewWallets: Listing[]
}

export interface PageParams {
  page?: number
  search?: string
  entries?: number
  version?: number
  device?: 'desktop' | 'mobile'
  chains?: string
  order?: 'asc' | 'desc'
}

export interface PlatformInfo {
  native: string
  universal: string
}

export interface Listing {
  id: string
  name: string
  description: string
  homepage: string
  chains: string[]
  versions: string[]
  app_type: string
  image_id: string
  image_url: {
    sm: string
    md: string
    lg: string
  }
  app: {
    browser: string
    ios: string
    android: string
    mac: string
    window: string
    linux: string
  }
  mobile: PlatformInfo
  desktop: PlatformInfo
  metadata: {
    shortName: string
    colors: {
      primary: string
      secondary: string
    }
  }
}

export interface ListingResponse {
  listings: Listing[]
  total: number
}

// -- ModalToastCtrl ------------------------------------------ //
export interface ModalToastCtrlState {
  open: boolean
  message: string
  variant: 'error' | 'success'
}

// -- RouterCtrl --------------------------------------------- //
export type RouterView =
  | 'CoinbaseExtensionConnector'
  | 'CoinbaseMobileConnector'
  | 'ConnectWallet'
  | 'GetWallet'
  | 'InjectedConnector'
  | 'LedgerDesktopConnector'
  | 'MetaMaskConnector'
  | 'PhantonConnector'
  | 'SelectNetwork'
  | 'WalletConnectConnector'
  | 'WalletExplorer'

export interface RouterCtrlState {
  history: RouterView[]
  view: RouterView
}

// -- ClientCtrl ------------------------------------------- //
export interface ClientCtrlState {
  initialized: boolean
  ethereum?: typeof Web3ModalEthereum
  solana?: typeof Web3ModalSolana
}

export type ClientCtrlSetEthereumClientArgs = EthereumOptions
