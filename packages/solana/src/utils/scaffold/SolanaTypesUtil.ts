import type {
  Connection as SolanaConnection,
  PublicKey,
  Transaction as SolanaWeb3Transaction,
  TransactionSignature,
  VersionedTransaction,
  SendOptions
} from '@solana/web3.js'

import type { SendTransactionOptions } from '@solana/wallet-adapter-base'
import type { ConnectorType } from '@web3modal/scaffold'

export type Connection = SolanaConnection

export interface ISolConfig {
  providers: ProviderType
  defaultChain?: number
  SSR?: boolean
}

export type ProviderType = {
  injected?: Provider
  coinbase?: Provider
  email?: boolean
  EIP6963?: boolean
  metadata: Metadata
}

export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface Provider extends ProviderEventEmitterMethods {
  // Metadata
  name: string
  publicKey?: PublicKey
  icon?: string
  chains: Chain[]
  type: ConnectorType

  // Methods
  connect: () => Promise<string>
  disconnect: () => Promise<void>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  signTransaction: <T extends AnyTransaction>(transaction: T) => Promise<T>
  signAndSendTransaction: (
    transaction: AnyTransaction,
    options?: SendOptions
  ) => Promise<TransactionSignature>
  signAllTransactions: (transactions: AnyTransaction[]) => Promise<SolanaWeb3Transaction[]>
  sendTransaction: (
    transaction: AnyTransaction,
    connection: Connection,
    options?: SendTransactionOptions
  ) => Promise<TransactionSignature>
}

export interface ProviderEventEmitterMethods {
  on: <E extends ProviderEventEmitterMethods.Event>(
    event: E,
    listener: (data: ProviderEventEmitterMethods.EventParams[E]) => void
  ) => void
  removeListener: <E extends ProviderEventEmitterMethods.Event>(
    event: E,
    listener: (data: ProviderEventEmitterMethods.EventParams[E]) => void
  ) => void
  emit: <E extends ProviderEventEmitterMethods.Event>(
    event: E,
    data: ProviderEventEmitterMethods.EventParams[E]
  ) => void
}

export namespace ProviderEventEmitterMethods {
  export type Event = keyof EventParams
  export type EventParams = {
    connect: PublicKey
    disconnect: undefined
    accountsChanged: PublicKey
    chainChanged: string
  }
}

export type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

export type Chain = {
  rpcUrl: string
  explorerUrl: string
  currency: string
  name: string
  chainId: string
}

export type AnyTransaction = SolanaWeb3Transaction | VersionedTransaction
