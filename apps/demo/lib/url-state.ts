import type { ChainNamespace } from '@reown/appkit-common'
import type {
  ConnectMethod,
  Features,
  RemoteFeatures,
  ThemeMode,
  ThemeVariables,
  WalletFeature
} from '@reown/appkit-controllers'

import { defaultCustomizationConfig } from '@/lib/defaultConfig'

export type URLState = {
  features: Features
  remoteFeatures: RemoteFeatures
  themeMode: ThemeMode
  themeVariables?: ThemeVariables
  enableWallets: boolean
  termsConditionsUrl?: string
  privacyPolicyUrl?: string
  walletFeaturesOrder?: WalletFeature[]
  connectMethodsOrder?: ConnectMethod[]
  collapseWallets?: boolean
  mixColor?: string
  accentColor?: string
  mixColorStrength?: number
  borderRadius?: string
  fontFamily?: string
  enabledChains?: ChainNamespace[]
  enabledNetworks?: string[]
}

export const urlStateUtils = {
  encodeState: (state: URLState): string => btoa(JSON.stringify(state)),

  decodeState: (encodedState: string): URLState | null => {
    try {
      return JSON.parse(atob(encodedState))
    } catch (e) {
      return defaultCustomizationConfig
    }
  },

  updateURLWithState: (state: Partial<URLState>) => {
    const initialConfig = urlStateUtils.getStateFromURL()

    const newState = {
      ...initialConfig,
      ...state,
      themeVariables: {
        ...initialConfig?.themeVariables,
        ...state.themeVariables
      }
    } as URLState

    const encodedState = urlStateUtils.encodeState(newState)
    const newURL = `${window.location.pathname}?config=${encodedState}`
    window.history.replaceState({}, '', newURL)
  },

  getStateFromURL: (): URLState | null => {
    if (typeof window === 'undefined') {
      return null
    }

    const params = new URLSearchParams(window.location.search)
    const encodedState = params.get('config')

    if (!encodedState) {
      return null
    }

    return urlStateUtils.decodeState(encodedState)
  }
}
