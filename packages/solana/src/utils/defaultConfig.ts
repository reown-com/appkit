import '@web3modal/polyfills'
import type { Connection, Transaction, TransactionSignature } from '@solana/web3.js'
import type { SendTransactionOptions } from '@solana/wallet-adapter-base'

import type { Chain, Metadata, Provider, ProviderType } from '@web3modal/scaffold-utils/solana'

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

export interface ConfigOptions {
  projectId?: string
  chains: Chain[]
  enableInjected?: boolean
  rpcUrl?: string
  defaultChainId?: number
  metadata: Metadata
}

export function defaultSolanaConfig(options: ConfigOptions) {
  const { enableInjected = true, metadata } = options

  let injectedProvider: Provider | undefined = undefined

  const providers: ProviderType = { metadata }

  function getInjectedProvider() {
    if (injectedProvider) {
      return injectedProvider
    }

    if (typeof window === 'undefined') {
      return undefined
    }

    if (!window.solana) {
      return undefined
    }

    //  @ts-expect-error window.ethereum satisfies Provider
    injectedProvider = window.solana

    return injectedProvider
  }

  if (enableInjected) {
    providers.injected = getInjectedProvider()
  }

  return providers
}
