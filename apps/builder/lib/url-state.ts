import {
  ConnectMethod,
  Features,
  ThemeMode,
  ThemeVariables,
  WalletFeature
} from '@reown/appkit-core'

type URLState = {
  features: Features
  themeMode: ThemeMode
  enableWallets: boolean
  termsConditions?: string
  privacyPolicy?: string
  walletFeatureOrder?: WalletFeature[]
  connectMethodOrder?: ConnectMethod[]
  collapseWallets?: boolean
  mixColor?: string
  accentColor?: string
  mixColorStrength?: number
  borderRadius?: number
  fontFamily?: string
  themeVariables?: ThemeVariables
}

export function getStateFromUrl(): URLState {
  if (typeof window === 'undefined')
    return { features: {}, themeMode: 'light', enableWallets: false }

  const params = new URLSearchParams(window.location.search)
  const stateParam = params.get('state')

  if (!stateParam) return { features: {}, themeMode: 'light', enableWallets: true }

  try {
    const decodedState = atob(stateParam)
    return JSON.parse(decodedState)
  } catch (e) {
    console.error('Failed to parse state from URL:', e)
    return { features: {}, themeMode: 'light', enableWallets: true }
  }
}

export function updateUrlState(obj: Object) {
  if (typeof window === 'undefined') return

  const currentState = getStateFromUrl()
  const state = {
    ...currentState,
    ...obj
  }
  const params = new URLSearchParams(window.location.search)

  // Convert state to base64 string to make URL more readable
  const stateStr = btoa(JSON.stringify(state))
  params.set('state', stateStr)

  const newUrl = `${window.location.pathname}?${params.toString()}`
  window.history.replaceState({}, '', newUrl)
}
