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

import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

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
