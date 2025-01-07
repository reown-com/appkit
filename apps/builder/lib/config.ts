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
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { urlStateUtils } from '@/lib/url-state'
import { ChainNamespace } from '@reown/appkit-common'

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

export const namespaceNetworksMap: Record<ChainNamespace, [AppKitNetwork, ...AppKitNetwork[]]> = {
  eip155: evmNetworks,
  solana: solanaNetworks,
  bip122: bitcoinNetworks,
  // @ts-expect-error Polkadot is not supported yet
  polkadot: []
}

export const networks = [...evmNetworks, ...solanaNetworks, ...bitcoinNetworks] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

export const evmAdapter = new EthersAdapter()

export const wagmiAdapter = new WagmiAdapter({
  // TODO(enes): It's problematic when use external storage
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const solanaAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

export const bitcoinAdapter = new BitcoinAdapter({})

// TODO(enes): It's problematic when use wagmiAdapter, it's not reconnecting after page refresh on Demo, not happening on lab. It's calling disconnect while syncing accounts, unlike the Ethers
export const allAdapters = [evmAdapter, solanaAdapter, bitcoinAdapter]

export const wagmiConfig = wagmiAdapter.wagmiConfig

const metadata = {
  name: 'AppKit Builder',
  description: 'The full stack toolkit to build onchain app UX',
  url: 'https://github.com/0xonerb/next-reown-appkit-ssr', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

export const initialConfig = urlStateUtils.getStateFromURL()
const initialEnabledChains = initialConfig?.enabledChains || ['eip155', 'solana', 'bip122']

const adapters: ChainAdapter[] = []
const initialNetworks: AppKitNetwork[] = []

initialEnabledChains.forEach(chain => {
  if (chain === 'eip155') {
    initialNetworks.push(...evmNetworks)
    return adapters.push(evmAdapter)
  }
  if (chain === 'solana') {
    initialNetworks.push(...solanaNetworks)
    return adapters.push(solanaAdapter)
  }
  if (chain === 'bip122') {
    initialNetworks.push(...bitcoinNetworks)
    return adapters.push(bitcoinAdapter)
  }
})

export const appKitConfigs = {
  adapters,
  projectId,
  networks: initialNetworks as [AppKitNetwork, ...AppKitNetwork[]],
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
