import { BitcoinAdapter } from '@laughingwhales/appkit-adapter-bitcoin'
import { EthersAdapter } from '@laughingwhales/appkit-adapter-ethers'
import { PolkadotAdapter } from '@laughingwhales/appkit-adapter-polkadot'
import { SolanaAdapter } from '@laughingwhales/appkit-adapter-solana'
import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@laughingwhales/appkit-common'
import { type ChainAdapter, ConstantsUtil } from '@laughingwhales/appkit-controllers'
import {
  type AppKitNetwork,
  arbitrum,
  assetHub,
  avalanche,
  base,
  bitcoin,
  bitcoinTestnet,
  bsc,
  kusama,
  mainnet,
  optimism,
  polkadot,
  polygon,
  solana,
  solanaDevnet,
  westend,
  zksync
} from '@laughingwhales/appkit/networks'
import { type CreateAppKit } from '@laughingwhales/appkit/react'

import { urlStateUtils } from '@/lib/url-state'

export const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']

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

export const polkadotNetworks = [polkadot, kusama, westend, assetHub] as AppKitNetworksType

export const namespaceNetworksMap: Partial<
  Record<ChainNamespace, [AppKitNetwork, ...AppKitNetwork[]]>
> = {
  eip155: evmNetworks,
  solana: solanaNetworks,
  bip122: bitcoinNetworks,
  polkadot: polkadotNetworks
}
export const allNetworks = [
  ...evmNetworks,
  ...solanaNetworks,
  ...bitcoinNetworks,
  ...polkadotNetworks
] as AppKitNetworksType
export const networks = [
  ...evmNetworks,
  ...solanaNetworks,
  ...bitcoinNetworks,
  ...polkadotNetworks
] as AppKitNetworksType

// Adapters
export const evmAdapter = new EthersAdapter()
export const solanaAdapter = new SolanaAdapter()
export const bitcoinAdapter = new BitcoinAdapter({})
export const polkadotAdapter = new PolkadotAdapter({
  appName: 'AppKit Builder'
})
export const allAdapters = [evmAdapter, solanaAdapter, bitcoinAdapter, polkadotAdapter]

// Metadata
const metadata = {
  name: 'AppKit Builder',
  description: 'The full stack toolkit to build onchain app UX',
  url: 'https://demo.reown.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

export const initialConfig = urlStateUtils.getStateFromURL()
const initialEnabledChains = initialConfig?.enabledChains || [
  'eip155',
  'solana',
  'bip122',
  'polkadot'
]
// Enabled network IDs
export const initialEnabledNetworks =
  initialConfig?.enabledNetworks || allNetworks.map(network => network.id)

// Enabled adapters
const adapters: ChainAdapter[] = []
// Enabled network object list
const initialNetworks: AppKitNetwork[] = []

// eslint-disable-next-line consistent-return
initialEnabledChains.forEach(chain => {
  if (chain === CommonConstantsUtil.CHAIN.EVM) {
    const enabledNetworks = evmNetworks.filter(network =>
      initialEnabledNetworks.includes(network.id)
    )
    initialNetworks.push(...enabledNetworks)

    adapters.push(evmAdapter)
  } else if (chain === CommonConstantsUtil.CHAIN.SOLANA) {
    const enabledNetworks = solanaNetworks.filter(network =>
      initialEnabledNetworks.includes(network.id)
    )
    initialNetworks.push(...enabledNetworks)

    adapters.push(solanaAdapter)
  } else if (chain === CommonConstantsUtil.CHAIN.BITCOIN) {
    const enabledNetworks = bitcoinNetworks.filter(network =>
      initialEnabledNetworks.includes(network.id)
    )
    initialNetworks.push(...enabledNetworks)

    adapters.push(bitcoinAdapter)
  } else if (chain === CommonConstantsUtil.CHAIN.POLKADOT) {
    const enabledNetworks = polkadotNetworks.filter(network =>
      initialEnabledNetworks.includes(network.id)
    )
    initialNetworks.push(...enabledNetworks)

    adapters.push(polkadotAdapter)
  }
})

export const appKitConfigs = {
  adapters: allAdapters,
  projectId,
  networks: initialNetworks as AppKitNetworksType,
  defaultNetwork: mainnet,
  metadata,
  features: initialConfig?.features || ConstantsUtil.DEFAULT_FEATURES,
  enableWallets: initialConfig?.enableWallets || true,
  themeMode: initialConfig?.themeMode || 'dark',
  themeVariables: initialConfig?.themeVariables || {},
  termsConditionsUrl: initialConfig?.termsConditionsUrl || '',
  privacyPolicyUrl: initialConfig?.privacyPolicyUrl || '',
  enableEmbedded: true
} as CreateAppKit
