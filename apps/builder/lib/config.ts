import { ChainAdapter, ConstantsUtil } from '@reown/appkit-core'
import {
  arbitrum,
  mainnet,
  optimism,
  polygon,
  zksync,
  base,
  solana,
  solanaTestnet,
  bitcoin,
  bitcoinTestnet,
  type AppKitNetwork,
  bsc,
  avalanche
} from '@reown/appkit/networks'
import { CreateAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { urlStateUtils } from '@/lib/url-state'
import { ChainNamespace } from '@reown/appkit-common'
import { NETWORK_OPTIONS } from '@/lib/constants'

type AppKitNetworksType = [AppKitNetwork, ...AppKitNetwork[]]

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Networks
export const evmNetworks = [
  mainnet,
  optimism,
  bsc,
  polygon,
  avalanche,
  arbitrum,
  zksync,
  base
] as AppKitNetworksType
export const solanaNetworks = [solana, solanaTestnet] as AppKitNetworksType
export const bitcoinNetworks = [bitcoin, bitcoinTestnet] as AppKitNetworksType
export const namespaceNetworksMap: Record<ChainNamespace, AppKitNetworksType> = {
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
export const allAdapters = [evmAdapter, solanaAdapter, bitcoinAdapter]

// Metadata
const metadata = {
  name: 'AppKit Builder',
  description: 'The full stack toolkit to build onchain app UX',
  url: 'https://github.com/0xonerb/next-reown-appkit-ssr', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

export const initialConfig = urlStateUtils.getStateFromURL()
const initialEnabledChains = initialConfig?.enabledChains || ['eip155', 'solana', 'bip122']
// Enabled network IDs
export const initialEnabledNetworks =
  initialConfig?.enabledNetworks || allNetworks.map(network => network.id)
console.log('initialEnabledNetworks', initialEnabledNetworks)

// Enabled adapters
const adapters: ChainAdapter[] = []
// Enabled network object list
let initialNetworks: AppKitNetwork[] = []

initialEnabledChains.forEach(chain => {
  if (chain === 'eip155') {
    const enabledNetworks = evmNetworks.filter(network =>
      initialEnabledNetworks.includes(network.id)
    )
    initialNetworks.push(...enabledNetworks)
    return adapters.push(evmAdapter)
  }
  if (chain === 'solana') {
    const enabledNetworks = solanaNetworks.filter(network =>
      initialEnabledNetworks.includes(network.id)
    )
    initialNetworks.push(...enabledNetworks)
    return adapters.push(solanaAdapter)
  }
  if (chain === 'bip122') {
    const enabledNetworks = bitcoinNetworks.filter(network =>
      initialEnabledNetworks.includes(network.id)
    )
    initialNetworks.push(...enabledNetworks)
    return adapters.push(bitcoinAdapter)
  }
})

export const appKitConfigs = {
  adapters,
  projectId,
  networks: initialNetworks as AppKitNetworksType,
  defaultNetwork: mainnet,
  metadata: metadata,
  features: initialConfig?.features || ConstantsUtil.DEFAULT_FEATURES,
  enableWallets: initialConfig?.enableWallets || true,
  themeMode: initialConfig?.themeMode || 'dark',
  themeVariables: initialConfig?.themeVariables || {},
  termsConditionsUrl: initialConfig?.termsConditionsUrl || '',
  privacyPolicyUrl: initialConfig?.privacyPolicyUrl || '',
  enableEmbedded: true
} as CreateAppKit
