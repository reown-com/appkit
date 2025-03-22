import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { type ChainNamespace } from '@reown/appkit-common'
import { ConstantsUtil } from '@reown/appkit-controllers'
import {
  type AppKitNetwork,
  arbitrum,
  avalanche,
  base,
  bitcoin,
  bitcoinTestnet,
  bsc,
  mainnet,
  optimism,
  polygon,
  solana,
  solanaDevnet,
  zksync
} from '@reown/appkit/networks'
import { CreateAppKit } from '@reown/appkit/react'

import { defaultCustomizationConfig } from '@/lib/defaultConfig'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Networks
type AppKitNetworksType = [AppKitNetwork, ...AppKitNetwork[]]

export const evmNetworks = [mainnet, optimism, bsc, polygon, avalanche, arbitrum, zksync, base] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

export const solanaNetworks = [solana, solanaDevnet] as AppKitNetworksType

export const bitcoinNetworks = [bitcoin, bitcoinTestnet] as AppKitNetworksType

export const namespaceNetworksMap: Record<ChainNamespace, [AppKitNetwork, ...AppKitNetwork[]]> = {
  eip155: evmNetworks,
  solana: solanaNetworks,
  bip122: bitcoinNetworks,
  // @ts-expect-error Polkadot is not supported yet
  polkadot: []
}
export const allNetworks = [
  ...evmNetworks,
  ...solanaNetworks,
  ...bitcoinNetworks
] as AppKitNetworksType
export const networks = [
  ...evmNetworks,
  ...solanaNetworks,
  ...bitcoinNetworks
] as AppKitNetworksType

// Adapters
export const evmAdapter = new EthersAdapter()
export const solanaAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})
export const bitcoinAdapter = new BitcoinAdapter({})

// Metadata
export const metadata = {
  name: 'AppKit Chat',
  description: 'Chat Onchain with AppKit',
  url: 'https://appkit-ai.vercel.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

export const appKitConfigs = {
  adapters: [evmAdapter, solanaAdapter, bitcoinAdapter],
  projectId,
  networks: allNetworks as AppKitNetworksType,
  defaultNetwork: mainnet,
  metadata: metadata,
  features: ConstantsUtil.DEFAULT_FEATURES,
  enableWallets: true,
  termsConditionsUrl: defaultCustomizationConfig?.termsConditionsUrl || '',
  privacyPolicyUrl: defaultCustomizationConfig?.privacyPolicyUrl || ''
} as CreateAppKit
