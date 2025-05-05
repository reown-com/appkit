import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { type ChainNamespace } from '@reown/appkit-common'
import { type ChainAdapter, ConstantsUtil } from '@reown/appkit-controllers'
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
import { type CreateAppKit } from '@reown/appkit/react'

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
export const allAdapters = [evmAdapter, solanaAdapter, bitcoinAdapter]

// Metadata
const metadata = {
  name: 'AppKit Builder',
  description: 'The full stack toolkit to build onchain app UX',
  url: 'https://demo.reown.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

export const initialConfig = urlStateUtils.getStateFromURL()
const initialEnabledChains = initialConfig?.enabledChains || ['eip155', 'solana', 'bip122']
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
