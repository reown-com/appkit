import {
  ConnectMethod,
  Features,
  ThemeMode,
  ThemeVariables,
  WalletFeature
} from '@reown/appkit-core'

export type URLState = {
  features: Features
  themeMode: ThemeMode
  themeVariables?: ThemeVariables
  enableWallets: boolean
  termsConditionsUrl?: string
  privacyPolicyUrl?: string
  walletFeatureOrder?: WalletFeature[]
  connectMethodOrder?: ConnectMethod[]
  collapseWallets?: boolean
  mixColor?: string
  accentColor?: string
  mixColorStrength?: number
  borderRadius?: string
  fontFamily?: string
}
