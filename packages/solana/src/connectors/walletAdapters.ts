import {
  PhantomWalletAdapter,
  BackpackWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter
} from './walletAdapters/index.js'

import type { Connector } from '@web3modal/scaffold'
import type { Chain } from '../utils/scaffold/SolanaTypesUtil.js'
import { solana, solanaDevnet, solanaTestnet } from '../utils/chains.js'
import { WalletAdapterNetwork, type BaseWalletAdapter } from '@solana/wallet-adapter-base'

export type AdapterKey = 'phantom' | 'solflare' | 'trustWallet' | 'backpack'
export const supportedWallets: AdapterKey[] = ['phantom', 'solflare', 'trustWallet', 'backpack']

const chainMap = {
  [solana.chainId]: WalletAdapterNetwork.Mainnet,
  [solanaDevnet.chainId]: WalletAdapterNetwork.Devnet,
  [solanaTestnet.chainId]: WalletAdapterNetwork.Testnet
}

export function createWalletAdapters(chain?: Chain) {
  return {
    phantom: new PhantomWalletAdapter(),
    trustWallet: new TrustWalletAdapter(),
    backpack: new BackpackWalletAdapter(),
    solflare: new SolflareWalletAdapter({
      network: chainMap[chain?.chainId || solana.chainId]
    })
  }
}

export function syncInjectedWallets(
  w3mConnectors: Connector[],
  adapters: Record<AdapterKey, BaseWalletAdapter>
) {
  supportedWallets.forEach(wallet => {
    if (window[wallet as keyof Window]) {
      w3mConnectors.push({
        id: adapters[wallet].name,
        type: 'ANNOUNCED',
        imageUrl: adapters[wallet].icon,
        name: adapters[wallet].name,
        provider: adapters[wallet]
      })
    }
  })
}
