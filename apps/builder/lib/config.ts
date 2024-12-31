import { ChainAdapter, ConstantsUtil } from '@reown/appkit-core'
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
  solana,
  solanaDevnet,
  solanaTestnet,
  bitcoin,
  bitcoinTestnet,
  type AppKitNetwork
} from '@reown/appkit/networks'
import { CreateAppKit, ThemeMode } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'

import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { urlStateUtils } from '@/lib/url-state'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const evmNetworks = [
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

export const solanaNetworks = [solana, solanaDevnet, solanaTestnet] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

export const bitcoinNetworks = [bitcoin, bitcoinTestnet] as [AppKitNetwork, ...AppKitNetwork[]]

export const networks = [...evmNetworks, ...solanaNetworks, ...bitcoinNetworks] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const solanaAdapter = new SolanaAdapter({})

export const bitcoinAdapter = new BitcoinAdapter({})

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

const metadata = {
  name: 'AppKit Builder',
  description: 'The full stack toolkit to build onchain app UX',
  url: 'https://github.com/0xonerb/next-reown-appkit-ssr', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

export const initialConfig = urlStateUtils.getStateFromURL()
const initialEnabledChains = initialConfig?.enabledChains || []

const adapters: ChainAdapter[] = []

initialEnabledChains.forEach(chain => {
  if (chain === 'evm') return adapters.push(wagmiAdapter)
  if (chain === 'solana') return adapters.push(solanaAdapter)
  if (chain === 'bitcoin') return adapters.push(bitcoinAdapter)
})

export const appKitConfigs = {
  adapters,
  projectId,
  networks,
  defaultNetwork: mainnet,
  metadata: metadata,
  features: initialConfig?.features || ConstantsUtil.DEFAULT_FEATURES,
  enableWallets: initialConfig?.enableWallets || true,
  themeMode: initialConfig?.themeMode || 'dark',
  themeVariables: initialConfig?.themeVariables || {},
  termsConditionsUrl: initialConfig?.termsConditionsUrl || '',
  privacyPolicyUrl: initialConfig?.privacyPolicyUrl || '',
  disableAppend: true
} as CreateAppKit
