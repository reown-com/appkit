import { BinanceWalletAdapter } from '@tronweb3/tronwallet-adapter-binance'
import { BitKeepAdapter } from '@tronweb3/tronwallet-adapter-bitkeep'
import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask-tron'
import { OkxWalletAdapter } from '@tronweb3/tronwallet-adapter-okxwallet'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'
import { TrustAdapter } from '@tronweb3/tronwallet-adapter-trust'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { TonAdapter } from '@reown/appkit-adapter-ton'
import { TronAdapter } from '@reown/appkit-adapter-tron'
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
  ton,
  tonTestnet,
  tronMainnet,
  zksync
} from '@reown/appkit/networks'
import { type CreateAppKit } from '@reown/appkit/react'

import { NAMESPACE_NETWORK_IDS_MAP } from '@/lib/constants'
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

export const tronNetworks = [tronMainnet] as AppKitNetworksType

export const tonNetworks = [ton, tonTestnet] as AppKitNetworksType

export const namespaceNetworksMap: Record<ChainNamespace, [AppKitNetwork, ...AppKitNetwork[]]> = {
  eip155: evmNetworks,
  solana: solanaNetworks,
  bip122: bitcoinNetworks,
  tron: tronNetworks,
  ton: tonNetworks,
  // @ts-expect-error Polkadot is not supported yet
  polkadot: []
}
export const allNetworks = [
  ...evmNetworks,
  ...solanaNetworks,
  ...bitcoinNetworks,
  ...tronNetworks,
  ...tonNetworks
] as AppKitNetworksType
export const networks = [
  ...evmNetworks,
  ...solanaNetworks,
  ...bitcoinNetworks,
  ...tronNetworks,
  ...tonNetworks
] as AppKitNetworksType

// Adapters
export const evmAdapter = new EthersAdapter()
export const solanaAdapter = new SolanaAdapter()
export const bitcoinAdapter = new BitcoinAdapter({})
export const tronAdapter = new TronAdapter({
  walletAdapters: [
    new TronLinkAdapter({ openUrlWhenWalletNotFound: false, checkTimeout: 3000 }),
    new TrustAdapter(),
    new BitKeepAdapter(),
    new BinanceWalletAdapter(),
    new OkxWalletAdapter({ openUrlWhenWalletNotFound: false }),
    // MetaMaskAdapter touches window in its constructor, which does not exist during server render
    ...(typeof window === 'undefined' ? [] : [new MetaMaskAdapter()])
  ]
})
export const tonAdapter = new TonAdapter()
export const allAdapters = [evmAdapter, solanaAdapter, bitcoinAdapter, tronAdapter, tonAdapter]

// Metadata
const metadata = {
  name: 'AppKit Builder',
  description: 'The full stack toolkit to build onchain app UX',
  // Wallets compare this with the page origin and warn or block on a mismatch
  url: typeof window === 'undefined' ? 'https://demo.reown.com' : window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

export const initialConfig = urlStateUtils.getStateFromURL()
// Enabled network IDs
export const initialEnabledNetworks =
  initialConfig?.enabledNetworks || allNetworks.map(network => network.id)
// Links saved before a chain existed carry networks but no chains, so a chain is on only if one of its networks is
export const initialEnabledChains: ChainNamespace[] =
  initialConfig?.enabledChains ||
  (Object.keys(NAMESPACE_NETWORK_IDS_MAP) as ChainNamespace[]).filter(namespace =>
    NAMESPACE_NETWORK_IDS_MAP[namespace].some(id => initialEnabledNetworks.includes(id))
  )

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
  } else if (chain === CommonConstantsUtil.CHAIN.TRON) {
    const enabledNetworks = tronNetworks.filter(network =>
      initialEnabledNetworks.includes(network.id)
    )
    initialNetworks.push(...enabledNetworks)

    adapters.push(tronAdapter)
  } else if (chain === CommonConstantsUtil.CHAIN.TON) {
    const enabledNetworks = tonNetworks.filter(network =>
      initialEnabledNetworks.includes(network.id)
    )
    initialNetworks.push(...enabledNetworks)

    adapters.push(tonAdapter)
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
