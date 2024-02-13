import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
import type {
  Connector,
} from '@web3modal/scaffold'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { TrustWalletAdapter } from '@solana/wallet-adapter-trust'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'


export type AdapterKey = 'phantom' | 'solflare' | 'trust' | 'backpack'

export const createWalletAdapters = () => ({
  /* walletConnect: new WalletConnectWalletAdapter({
      network: WalletAdapterNetwork.Mainnet, options: {
        projectId: process.env['NEXT_PUBLIC_PROJECT_ID'],
        relayUrl: 'wss://relay.walletconnect.com',
      },
  }), */
  phantom: new PhantomWalletAdapter(),
  trust: new TrustWalletAdapter(),
  backpack: new BackpackWalletAdapter(),
  solflare: new SolflareWalletAdapter()
})

declare global {
  interface Window {
    originalSolana?: Record<string, unknown>
    solana?: Record<string, any>
    solflare?: Record<string, any>
    backpack?: Record<string, any>
    trustWallet?: Record<string, any>
    phantom?: Record<string, any>
  }
}

export const syncInjectedWallets = (w3mConnectors: Connector[], adapters: Record<AdapterKey, BaseWalletAdapter>) => {
  const keysMap = {
    phantom: 'phantom',
    solflare: 'solflare',
    trustWallet: 'trust',
    backack: 'backpack',
  } as Record<string, AdapterKey>

  Object.keys(keysMap).map((wallet: string) => {
    const adapterKey = keysMap[wallet as keyof typeof keysMap] as AdapterKey;
    if (window[wallet as keyof Window]) {
      w3mConnectors.push({
        id: adapters[adapterKey].name,
        type: 'ANNOUNCED',
        imageUrl: adapters[adapterKey].icon,
        name: adapters[adapterKey].name,
        provider: adapters[adapterKey],
        info: {
          rdns: `app.${[keysMap[wallet]]}`,
        }
      })
    }
  })
}

