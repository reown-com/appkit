import { BinanceWalletAdapter } from '@tronweb3/tronwallet-adapter-binance'
import { BitKeepAdapter } from '@tronweb3/tronwallet-adapter-bitkeep'
import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask-tron'
import { OkxWalletAdapter } from '@tronweb3/tronwallet-adapter-okxwallet'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'
import { TrustAdapter } from '@tronweb3/tronwallet-adapter-trust'

import type { ChainAdapter } from '@reown/appkit'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { TonAdapter } from '@reown/appkit-adapter-ton'
import { TronAdapter } from '@reown/appkit-adapter-tron'
import { ReownTronAdapter } from '@reown/appkit-adapter-tron/testing'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { type Adapter, type WagmiConfig, appKitConfigs } from '@/src/constants/appKitConfigs'

const solanaAdapter = new SolanaAdapter()
const ethersAdapter = new EthersAdapter()
const ethers5Adapter = new Ethers5Adapter()
const bitcoinAdapter = new BitcoinAdapter()
const tonAdapter = new TonAdapter()
const tronAdapter = new TronAdapter({
  walletAdapters: [
    /* Reown extension (must be first for priority) */
    new ReownTronAdapter(),
    new TronLinkAdapter({ openUrlWhenWalletNotFound: false, checkTimeout: 3000 }),
    new TrustAdapter(),
    new BitKeepAdapter(),
    new BinanceWalletAdapter(),
    new OkxWalletAdapter({ openUrlWhenWalletNotFound: false }),
    new MetaMaskAdapter()
  ]
})

export function getAppKitConfigByName(name: string) {
  return appKitConfigs[name] || undefined
}

export function getAppKitAdapters(
  adapters: Adapter[] | undefined,
  wagmiConfig: WagmiConfig | undefined
) {
  const appKitAdapters: ChainAdapter[] = []

  adapters?.forEach(adapter => {
    if (adapter === 'wagmi' && wagmiConfig) {
      const wagmiAdapter = new WagmiAdapter(wagmiConfig)

      appKitAdapters.push(wagmiAdapter)
    }
    if (adapter === 'ethers') {
      appKitAdapters.push(ethersAdapter)
    }
    if (adapter === 'ethers5') {
      appKitAdapters.push(ethers5Adapter)
    }
    if (adapter === 'solana') {
      appKitAdapters.push(solanaAdapter)
    }
    if (adapter === 'bitcoin') {
      appKitAdapters.push(bitcoinAdapter)
    }
    if (adapter === 'ton') {
      appKitAdapters.push(tonAdapter)
    }
    if (adapter === 'tron') {
      appKitAdapters.push(tronAdapter)
    }
  })

  return appKitAdapters
}
