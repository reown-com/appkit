import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { type ChainNamespace } from '@reown/appkit-common'
import { ChainAdapter, ConstantsUtil } from '@reown/appkit-controllers'
import {
  type AppKitNetwork,
  arbitrum,
  aurora,
  base,
  baseSepolia,
  berachain,
  bitcoin,
  bitcoinTestnet,
  gnosis,
  hedera,
  mainnet,
  mantle,
  optimism,
  polygon,
  sepolia,
  solana,
  solanaDevnet,
  solanaTestnet,
  unichainSepolia,
  zksync
} from '@reown/appkit/networks'
import { CreateAppKit } from '@reown/appkit/react'

import { urlStateUtils } from '@/lib/url-state'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Networks
type AppKitNetworksType = [AppKitNetwork, ...AppKitNetwork[]]

export const evmNetworks = [
  mainnet,
  optimism,
  polygon,
  zksync,
  arbitrum,
  base,
  baseSepolia,
  unichainSepolia,
  berachain,
  sepolia,
  gnosis,
  hedera,
  aurora,
  mantle
] as [AppKitNetwork, ...AppKitNetwork[]]

export const solanaNetworks = [solana, solanaTestnet, solanaDevnet] as AppKitNetworksType

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
  url: 'https://demo.reown.com', // origin must match your domain & subdomain
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
