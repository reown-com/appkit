import type { ChainAdapter } from '@reown/appkit'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { TonAdapter } from '@reown/appkit-adapter-ton'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { type Adapter, type WagmiConfig, appKitConfigs } from '@/src/constants/appKitConfigs'

const solanaAdapter = new SolanaAdapter()
const ethersAdapter = new EthersAdapter()
const ethers5Adapter = new Ethers5Adapter()
const bitcoinAdapter = new BitcoinAdapter()
const tonAdapter = new TonAdapter()

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
  })

  return appKitAdapters
}
