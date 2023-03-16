import type { Chain, EthereumClient } from '@web3modal/ethereum'

export interface MobileWallet {
  id: string
  name: string
  links: {
    universal: string
    native?: string
  }
}

export interface DesktopWallet {
  id: string
  name: string
  links: {
    native: string
    universal: string
  }
}

// -- ConfigCtrl ------------------------------------------- //
export interface ConfigCtrlState {
  projectId: string
  walletConnectVersion?: 1 | 2
  standaloneChains?: string[]
  defaultChain?: Chain
  mobileWallets?: MobileWallet[]
  desktopWallets?: DesktopWallet[]
  walletImages?: Record<string, string>
  chainImages?: Record<string, string>
  tokenImages?: Record<string, string>
  enableStandaloneMode?: boolean
  enableNetworkView?: boolean
  enableAccountView?: boolean
  enableExplorer?: boolean
  explorerAllowList?: string[]
  explorerDenyList?: string[]
  termsOfServiceUrl?: string
  privacyPolicyUrl?: string
}

// -- ModalCtrl --------------------------------------- //
export interface ModalCtrlState {
  open: boolean
}

// -- OptionsCtrl --------------------------------------- //
export interface OptionsCtrlState {
  selectedChain?: Chain
  chains?: EthereumClient['chains']
  standaloneChains?: string[]
  standaloneUri?: string
  isStandalone: boolean
  isCustomDesktop: boolean
  isCustomMobile: boolean
  isDataLoaded: boolean
  isUiLoaded: boolean
  walletConnectVersion: 1 | 2
}

// -- AccountCtrl -------------------------------------------- //
export interface AccountCtrlState {
  address?: `0x${string}`
  isConnected: boolean
  profileName?: string | null
  profileAvatar?: string | null
  profileLoading?: boolean
  balanceLoading?: boolean
  balance?: { amount: string; symbol: string }
}

// -- ExplorerCtrl ------------------------------------------- //
export interface ExplorerCtrlState {
  wallets: ListingResponse & { page: number }
  search: ListingResponse & { page: number }
  previewWallets: Listing[]
  recomendedWallets: Listing[]
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
  | 'Account'
  | 'Connectors'
  | 'ConnectWallet'
  | 'DesktopConnector'
  | 'GetWallet'
  | 'Help'
  | 'InjectedConnector'
  | 'InstallConnector'
  | 'Qrcode'
  | 'SelectNetwork'
  | 'SwitchNetwork'
  | 'WalletExplorer'

export interface DesktopConnectorData {
  name: string
  native?: string
  universal?: string
  icon?: string
  walletId?: string
}

export type SwitchNetworkData = Chain

export interface InstallConnectorData {
  id: string
  name: string
  url: string
  isMobile?: boolean
}

export interface RouterCtrlState {
  history: RouterView[]
  view: RouterView
  data?: {
    DesktopConnector?: DesktopConnectorData
    SwitchNetwork?: SwitchNetworkData
    InstallConnector?: InstallConnectorData
  }
}

// -- ClientCtrl ------------------------------------------- //
export interface ClientCtrlState {
  ethereumClient?: EthereumClient
}

// -- ThemeCtrl -------------------------------------------- //
export interface ThemeCtrlState {
  themeVariables?: {
    '--w3m-z-index'?: string
    '--w3m-accent-color'?: string
    '--w3m-accent-fill-color'?: string
    '--w3m-background-color'?: string
    '--w3m-background-image-url'?: string
    '--w3m-logo-image-url'?: string
    '--w3m-background-border-radius'?: string
    '--w3m-container-border-radius'?: string
    '--w3m-wallet-icon-border-radius'?: string
    '--w3m-input-border-radius'?: string
    '--w3m-notification-border-radius'?: string
    '--w3m-button-border-radius'?: string
    '--w3m-secondary-button-border-radius'?: string
    '--w3m-icon-button-border-radius'?: string
    '--w3m-button-hover-highlight-border-radius'?: string
    '--w3m-font-family'?: string

    '--w3m-text-big-bold-size'?: string
    '--w3m-text-big-bold-weight'?: string
    '--w3m-text-big-bold-line-height'?: string
    '--w3m-text-big-bold-letter-spacing'?: string
    '--w3m-text-big-bold-text-transform'?: string
    '--w3m-text-big-bold-font-family'?: string

    '--w3m-text-medium-regular-size'?: string
    '--w3m-text-medium-regular-weight'?: string
    '--w3m-text-medium-regular-line-height'?: string
    '--w3m-text-medium-regular-letter-spacing'?: string
    '--w3m-text-medium-regular-text-transform'?: string
    '--w3m-text-medium-regular-font-family'?: string

    '--w3m-text-small-regular-size'?: string
    '--w3m-text-small-regular-weight'?: string
    '--w3m-text-small-regular-line-height'?: string
    '--w3m-text-small-regular-letter-spacing'?: string
    '--w3m-text-small-regular-text-transform'?: string
    '--w3m-text-small-regular-font-family'?: string

    '--w3m-text-small-thin-size'?: string
    '--w3m-text-small-thin-weight'?: string
    '--w3m-text-small-thin-line-height'?: string
    '--w3m-text-small-thin-letter-spacing'?: string
    '--w3m-text-small-thin-text-transform'?: string
    '--w3m-text-small-thin-font-family'?: string

    '--w3m-text-xsmall-bold-size'?: string
    '--w3m-text-xsmall-bold-weight'?: string
    '--w3m-text-xsmall-bold-line-height'?: string
    '--w3m-text-xsmall-bold-letter-spacing'?: string
    '--w3m-text-xsmall-bold-text-transform'?: string
    '--w3m-text-xsmall-bold-font-family'?: string

    '--w3m-text-xsmall-regular-size'?: string
    '--w3m-text-xsmall-regular-weight'?: string
    '--w3m-text-xsmall-regular-line-height'?: string
    '--w3m-text-xsmall-regular-letter-spacing'?: string
    '--w3m-text-xsmall-regular-text-transform'?: string
    '--w3m-text-xsmall-regular-font-family'?: string
  }
  themeMode?: 'dark' | 'light'
}
