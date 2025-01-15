import { cookieStorage, createStorage } from '@wagmi/core'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { ConstantsUtil } from '@reown/appkit-core'
import {
  type AppKitNetwork,
  arbitrum,
  aurora,
  base,
  baseSepolia,
  gnosis,
  hedera,
  mainnet,
  optimism,
  polygon,
  sepolia,
  unichainSepolia,
  zksync
} from '@reown/appkit/networks'
import { ThemeMode } from '@reown/appkit/react'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
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

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

export const defaultCustomizationConfig = {
  features: ConstantsUtil.DEFAULT_FEATURES,
  collapseWallets: false,
  enableWallets: true,
  themeMode: 'dark' as ThemeMode,
  themeVariables: {},
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  enableEmbedded: true
}
