import type { Connection, Transaction, TransactionSignature } from '@solana/web3.js'
import type { BaseWalletAdapter, SendTransactionOptions } from '@solana/wallet-adapter-base'
import type {
  Connector,
} from '@web3modal/scaffold'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { TrustWalletAdapter } from '@solana/wallet-adapter-trust'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'


export type AdapterKey = 'phantom' | 'solflare' | 'trustWallet' | 'backpack'
export const supportedWallets: AdapterKey[] = ['phantom', 'solflare', 'trustWallet', 'backpack']

export function createWalletAdapters() {
  return {
    phantom: new PhantomWalletAdapter(),
    trustWallet: new TrustWalletAdapter(),
    backpack: new BackpackWalletAdapter(),
    solflare: new SolflareWalletAdapter()
  }
}


interface SolanaProvider {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  isPhantom: boolean
  request: () => void
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
  signAndSendAllTransactions: (transactions: Transaction[]) => Promise<TransactionSignature[]>
  signAndSendTransaction: (transaction: Transaction, connection: Connection, options?: SendTransactionOptions) => Promise<TransactionSignature>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  signTransaction: () => Promise<TransactionSignature>
  sendTransaction: (transaction: Transaction, connection: Connection, options?: SendTransactionOptions) => Promise<TransactionSignature>
}
declare global {
  interface Window {
    originalSolana?: Record<string, unknown>,
    solana?: SolanaProvider,
    solflare?: { solana: SolanaProvider },
    backpack?: { solana: SolanaProvider },
    trustWallet?: { solana: SolanaProvider },
    phantom?: { solana: SolanaProvider }
  }
}

export function syncInjectedWallets(w3mConnectors: Connector[], adapters: Record<AdapterKey, BaseWalletAdapter>) {
  supportedWallets.forEach((wallet) => {
    if (window[wallet as keyof Window]) {
      w3mConnectors.push({
        id: adapters[wallet].name,
        type: 'ANNOUNCED',
        imageUrl: adapters[wallet].icon,
        name: adapters[wallet].name,
        provider: adapters[wallet],
        info: {
          rdns: `app.${wallet}`,
        }
      })
    }
  })
}

