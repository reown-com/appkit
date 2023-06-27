import type { EthereumClient } from '@web3modal/ethereum'

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

export interface Chain {
  id: number
  name: string
}

// -- ConfigCtrl ------------------------------------------- //
export interface ConfigCtrlState {
  projectId: string
  defaultChain?: Chain
  mobileWallets?: MobileWallet[]
  desktopWallets?: DesktopWallet[]
  walletImages?: Record<string, string>
  chainImages?: Record<string, string>
  tokenImages?: Record<string, string>
  tokenContracts?: Record<number, string>
  enableNetworkView?: boolean
  enableAccountView?: boolean
  enableExplorer?: boolean
  explorerRecommendedWalletIds?: string[] | 'NONE'
  explorerExcludedWalletIds?: string[] | 'ALL'
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
  isCustomDesktop: boolean
  isCustomMobile: boolean
  isDataLoaded: boolean
  isUiLoaded: boolean
  isPreferInjected: boolean
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
  injectedWallets: Listing[]
  search: ListingResponse & { page: number }
  recomendedWallets: Listing[]
}

export interface ListingParams {
  page?: number
  search?: string
  entries?: number
  version?: number
  chains?: string
  recommendedIds?: string
  excludedIds?: string
  sdks?: string
}

export interface Listing {
  id: string
  name: string
  homepage: string
  image_id: string
  app: {
    browser?: string
    ios?: string
    android?: string
    mac?: string
    windows?: string
    linux?: string
    chrome?: string
    firefox?: string
    safari?: string
    edge?: string
    opera?: string
  }
  injected: {
    injected_id: string
    namespace: string
  }[]
  mobile: {
    native: string
    universal: string
  }
  desktop: {
    native: string
    universal: string
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
  | 'ConnectWallet'
  | 'DesktopConnecting'
  | 'GetWallet'
  | 'Help'
  | 'InjectedConnecting'
  | 'InstallWallet'
  | 'MobileConnecting'
  | 'MobileQrcodeConnecting'
  | 'Qrcode'
  | 'SelectNetwork'
  | 'SwitchNetwork'
  | 'WalletExplorer'
  | 'WebConnecting'

export interface WalletData {
  id: string
  name: string
  homepage?: string
  image_id?: string
  app?: {
    browser?: string
    ios?: string
    android?: string
  }
  injected?: {
    injected_id?: string
    namespace?: string
  }[]
  mobile?: {
    native?: string
    universal?: string
  }
  desktop?: {
    native?: string
    universal?: string
  }
}

export type SwitchNetworkData = Chain

export interface RouterCtrlState {
  history: RouterView[]
  view: RouterView
  data?: {
    Wallet?: WalletData
    SwitchNetwork?: SwitchNetworkData
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
    '--w3m-wallet-icon-large-border-radius'?: string
    '--w3m-wallet-icon-small-border-radius'?: string
    '--w3m-input-border-radius'?: string
    '--w3m-notification-border-radius'?: string
    '--w3m-button-border-radius'?: string
    '--w3m-secondary-button-border-radius'?: string
    '--w3m-icon-button-border-radius'?: string
    '--w3m-button-hover-highlight-border-radius'?: string
    '--w3m-font-family'?: string
    '--w3m-font-feature-settings'?: string

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

    '--w3m-overlay-background-color'?: string
    '--w3m-overlay-backdrop-filter'?: string
  }
  themeMode?: 'dark' | 'light'
}

// -- WcConnectionCtrl ------------------------------------- //
export interface WcConnectionCtrlState {
  pairingEnabled: boolean
  pairingUri: string
  pairingError: boolean
}

// -- EventsCrrl ------------------------------------------- //
export type ModalEventData =
  | {
      name: 'ACCOUNT_BUTTON'
    }
  | {
      name: 'ACCOUNT_CONNECTED'
    }
  | {
      name: 'ACCOUNT_DISCONNECTED'
    }
  | {
      name: 'CONNECT_BUTTON'
    }
  | {
      name: 'DISCONNECT_BUTTON'
    }
  | {
      name: 'NETWORK_BUTTON'
    }
  | {
      name: 'WALLET_BUTTON'
      walletId: string
    }

export interface ModalEvent {
  type: 'CLICK' | 'TRACK' | 'VIEW'
  name: ModalEventData['name']
  timestamp: number
  userSessionId: string
  data?: ModalEventData
}

export interface EventsCtrlState {
  enabled: boolean
  userSessionId: string
  events: ModalEvent[]
  connectedWalletId?: string
}
