import { ConstantsUtil } from '@reown/appkit-core'
import {
  arbitrum,
  mainnet,
  optimism,
  polygon,
  zksync,
  sepolia,
  base,
  baseSepolia,
  gnosis,
  unichainSepolia,
  hedera,
  aurora,
  type AppKitNetwork
} from '@reown/appkit/networks'
import { ThemeMode } from '@reown/appkit/react'

export const defaultCustomizationConfig = {
  features: ConstantsUtil.DEFAULT_FEATURES,
  collapseWallets: false,
  enableWallets: true,
  themeMode: 'dark' as ThemeMode,
  themeVariables: {},
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  experimental_enableEmbedded: true
}

const EvmNetworks = [
  mainnet,
  optimism,
  polygon,
  zksync,
  arbitrum,
  base,
  baseSepolia,
  unichainSepolia,
  sepolia,
  gnosis,
  hedera,
  aurora
] as [AppKitNetwork, ...AppKitNetwork[]]

export const networks = [...EvmNetworks] as [AppKitNetwork, ...AppKitNetwork[]]
