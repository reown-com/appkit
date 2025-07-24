import type { SendTransactionOptions } from '@solana/wallet-adapter-base'
import type {
  PublicKey,
  SendOptions,
  Connection as SolanaConnection,
  Transaction as SolanaWeb3Transaction,
  TransactionSignature,
  VersionedTransaction
} from '@solana/web3.js'
import UniversalProvider from '@walletconnect/universal-provider'

import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import type { ConnectorType } from '@reown/appkit-controllers'
import type { Provider as CoreProvider } from '@reown/appkit-controllers'
import type { W3mFrameProvider, W3mFrameTypes } from '@reown/appkit-wallet'

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

export interface Provider
  extends ProviderEventEmitterMethods,
    Omit<CoreProvider, 'emit' | 'on' | 'removeListener'> {
  // Metadata
  id: string
  name: string
  chains: CaipNetwork[]
  type: ConnectorType
  chain: ChainNamespace
  publicKey?: PublicKey
  provider: CoreProvider | W3mFrameProvider | UniversalProvider

  // Methods
  connect: (params?: {
    chainId?: string
    onUri?: ((uri: string) => void) | undefined
    socialUri?: string
  }) => Promise<string>
  disconnect: () => Promise<void>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  signTransaction: <T extends AnyTransaction>(transaction: T) => Promise<T>
  signAndSendTransaction: (
    transaction: AnyTransaction,
    options?: SendOptions
  ) => Promise<TransactionSignature>
  sendTransaction: (
    transaction: AnyTransaction,
    connection: Connection,
    options?: SendTransactionOptions
  ) => Promise<TransactionSignature>
  signAllTransactions: <T extends AnyTransaction[]>(transactions: T) => Promise<T>
  getAccounts: () => Promise<
    {
      namespace: 'solana'
      address: string
      type: 'eoa'
    }[]
  >
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
    pendingTransaction: undefined
    auth_rpcRequest: W3mFrameTypes.RPCRequest
    auth_rpcSuccess: W3mFrameTypes.FrameEvent
    auth_rpcError: Error
  }
}

export type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

export type AnyTransaction = SolanaWeb3Transaction | VersionedTransaction

export type GetActiveChain = () => CaipNetwork | undefined

export type SPLTokenTransactionArgs = {
  provider: Provider
  connection: Connection
  to: string
  amount: number
  tokenMint: string
}
