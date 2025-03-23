import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { ConstantsUtil } from '@reown/appkit-controllers'
import {
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

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const evmAdapter = new EthersAdapter()

export const solanaAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

export const bitcoinAdapter = new BitcoinAdapter({})

export const metadata = {
  name: 'AppKit Chat',
  description: 'Chat Onchain with AppKit',
  url: 'https://appkit-ai.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

export const appKitConfigs = {
  adapters: [evmAdapter, solanaAdapter, bitcoinAdapter],
  projectId,
  networks: [
    mainnet,
    optimism,
    bsc,
    polygon,
    avalanche,
    arbitrum,
    zksync,
    base,
    solana,
    solanaDevnet,
    bitcoin,
    bitcoinTestnet
  ],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: ConstantsUtil.DEFAULT_FEATURES,
  themeMode: 'dark',
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy'
} as CreateAppKit
