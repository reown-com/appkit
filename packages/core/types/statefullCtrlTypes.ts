import type { Chain, EthereumOptions, Web3ModalEthereum } from '@web3modal/ethereum'

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
  standaloneChains?: string[]
}

export interface ConfigCtrlState extends ConfigOptions {
  configured: boolean
}

// -- ModalCtrl --------------------------------------- //
export interface ModalCtrlState {
  open: boolean
  wcUri?: string
}

// -- OptionsCtrl --------------------------------------- //
export interface OptionsCtrlState {
  selectedChainId?: number
  chains?: Chain[]
  standaloneChains?: string[]
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
  order?: 'asc' | 'desc'
  chains?: string
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

// -- ToastCtrl ------------------------------------------ //
export interface ToastCtrlState {
  open: boolean
  message: string
  variant: 'error' | 'success'
}

// -- RouterCtrl --------------------------------------------- //
export type RouterView =
  | 'CoinbaseExtensionConnector'
  | 'CoinbaseMobileConnector'
  | 'ConnectWallet'
  | 'DesktopConnector'
  | 'GetWallet'
  | 'InjectedConnector'
  | 'MetaMaskConnector'
  | 'Qrcode'
  | 'SelectNetwork'
  | 'WalletExplorer'

export interface RouterCtrlState {
  history: RouterView[]
  view: RouterView
  data?: {
    DesktopConnector: {
      name: string
      deeplink?: string
      universal?: string
      icon?: string
    }
  }
}

// -- ClientCtrl ------------------------------------------- //
export interface ClientCtrlState {
  initialized: boolean
  ethereum?: typeof Web3ModalEthereum
}

export type ClientCtrlSetEthereumClientArgs = EthereumOptions
