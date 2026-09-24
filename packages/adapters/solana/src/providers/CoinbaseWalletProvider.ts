import { fromLegacyPublicKey } from '@solana/compat'
import type { Connection, PublicKey, SendOptions } from '@solana/web3.js'
import { VersionedTransaction } from '@solana/web3.js'

import {
  type CaipNetwork,
  ConstantsUtil as CommonConstantsUtil,
  ConstantsUtil,
  PresetsUtil,
  UserRejectedRequestError
} from '@reown/appkit-common'
import type { RequestArguments } from '@reown/appkit-controllers'
import type { Provider as CoreProvider } from '@reown/appkit-controllers'
import {
  type AnySolanaKitTransaction,
  type AnyTransaction,
  type Provider as SolanaProvider
} from '@reown/appkit-utils/solana'
import { solana } from '@reown/appkit/networks'

import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'
import {
  decodeSolanaKitTransaction,
  encodeSolanaKitTransaction,
  isAnySolanaKitTransaction
} from './shared/SolanaKitTransaction.js'

export type SolanaCoinbaseWallet = {
  publicKey?: PublicKey
  signTransaction<T extends AnyTransaction>(transaction: T): Promise<T>
  signAllTransactions<T extends AnyTransaction>(transactions: T[]): Promise<T[]>
  signAndSendTransaction<T extends AnyTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: string }>
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>
  connect(): Promise<void>
  disconnect(): Promise<void>
  emit(event: string, ...args: unknown[]): void
}

export type CoinbaseWalletProviderConfig = {
  provider: SolanaCoinbaseWallet
  chains: CaipNetwork[]
  getActiveChain: () => CaipNetwork | undefined
}

export class CoinbaseWalletProvider extends ProviderEventEmitter implements SolanaProvider {
  public readonly name = 'Coinbase Wallet'
  public readonly id =
    PresetsUtil.ConnectorExplorerIds[ConstantsUtil.CONNECTOR_ID.COINBASE_SDK] || this.name
  public readonly explorerId =
    PresetsUtil.ConnectorExplorerIds[ConstantsUtil.CONNECTOR_ID.COINBASE_SDK]
  public readonly type = 'ANNOUNCED'
  public readonly imageUrl =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSI1MTIiIGN5PSI1MTIiIHI9IjUxMiIgZmlsbD0iIzAwNTJGRiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1MiA1MTJDMTUyIDcxMC44MjMgMzEzLjE3NyA4NzIgNTEyIDg3MkM3MTAuODIzIDg3MiA4NzIgNzEwLjgyMyA4NzIgNTEyQzg3MiAzMTMuMTc3IDcxMC44MjMgMTUyIDUxMiAxNTJDMzEzLjE3NyAxNTIgMTUyIDMxMy4xNzcgMTUyIDUxMlpNNDIwIDM5NkM0MDYuNzQ1IDM5NiAzOTYgNDA2Ljc0NSAzOTYgNDIwVjYwNEMzOTYgNjE3LjI1NSA0MDYuNzQ1IDYyOCA0MjAgNjI4SDYwNEM2MTcuMjU1IDYyOCA2MjggNjE3LjI1NSA2MjggNjA0VjQyMEM2MjggNDA2Ljc0NSA2MTcuMjU1IDM5NiA2MDQgMzk2SDQyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='
  public readonly chain = ConstantsUtil.CHAIN.SOLANA
  public readonly provider = this as CoreProvider

  private coinbase: SolanaCoinbaseWallet
  private requestedChains: CaipNetwork[]

  constructor(params: CoinbaseWalletProviderConfig) {
    super()
    this.coinbase = params.provider
    this.requestedChains = params.chains
  }

  public get chains() {
    // For Coinbase Wallet, we only support the Solana mainnet
    return this.requestedChains.filter(chain => chain.id === solana.id)
  }

  public get publicKey() {
    return this.coinbase.publicKey
  }

  public get address() {
    return this.publicKey ? fromLegacyPublicKey(this.publicKey) : undefined
  }

  public get imageId() {
    return PresetsUtil.ConnectorImageIds[CommonConstantsUtil.CONNECTOR_ID.COINBASE]
  }

  public async connect() {
    try {
      await this.coinbase.connect()
      const account = this.getAccount(true)
      this.coinbase.emit('connect', this.coinbase.publicKey)
      this.emit('connect', account)

      return account.toBase58()
    } catch (error) {
      this.coinbase.emit('error', error)
      throw new UserRejectedRequestError(error)
    }
  }

  public async disconnect() {
    await this.coinbase.disconnect()
    this.coinbase.emit('disconnect', undefined)
    this.emit('disconnect', undefined)
  }

  public async signMessage(message: Uint8Array) {
    const result = await this.coinbase.signMessage(message)

    return result.signature
  }

  public async signTransaction<T extends AnyTransaction | AnySolanaKitTransaction>(transaction: T) {
    if (isAnySolanaKitTransaction(transaction)) {
      const legacyTransaction = VersionedTransaction.deserialize(
        encodeSolanaKitTransaction(transaction)
      )
      const signedLegacyTransaction = await this.coinbase.signTransaction(legacyTransaction)

      return decodeSolanaKitTransaction(new Uint8Array(signedLegacyTransaction.serialize())) as T
    }

    return this.coinbase.signTransaction(transaction) as Promise<T>
  }

  public async signAndSendTransaction<T extends AnyTransaction | AnySolanaKitTransaction>(
    transaction: T,
    sendOptions?: SendOptions
  ) {
    const legacyTransaction: AnyTransaction = isAnySolanaKitTransaction(transaction)
      ? VersionedTransaction.deserialize(encodeSolanaKitTransaction(transaction))
      : transaction
    const result = await this.coinbase.signAndSendTransaction(legacyTransaction, sendOptions)

    return result.signature
  }

  public async sendTransaction(
    transaction: AnyTransaction | AnySolanaKitTransaction,
    connection: Connection,
    options?: SendOptions
  ) {
    const signedTransaction = await this.signTransaction(transaction)
    const rawTransaction = isAnySolanaKitTransaction(signedTransaction)
      ? encodeSolanaKitTransaction(signedTransaction)
      : signedTransaction.serialize()
    const signature = await connection.sendRawTransaction(rawTransaction, options)

    return signature
  }

  public async signAllTransactions<T extends (AnyTransaction | AnySolanaKitTransaction)[]>(
    transactions: T
  ): Promise<T> {
    const legacyTransactions: AnyTransaction[] = transactions.map(transaction =>
      isAnySolanaKitTransaction(transaction)
        ? VersionedTransaction.deserialize(encodeSolanaKitTransaction(transaction))
        : transaction
    )

    const signedLegacyTransactions = await this.coinbase.signAllTransactions(legacyTransactions)

    return signedLegacyTransactions.map((signedTransaction, index) => {
      const originalTransaction = transactions[index]

      if (originalTransaction && isAnySolanaKitTransaction(originalTransaction)) {
        return decodeSolanaKitTransaction(
          new Uint8Array((signedTransaction as VersionedTransaction).serialize())
        )
      }

      return signedTransaction
    }) as T
  }

  public async request<T>(_args: RequestArguments): Promise<T> {
    return Promise.reject(new Error('The "request" method is not supported on Coinbase Wallet'))
  }

  public async getAccounts() {
    const account = this.getAccount()
    if (!account) {
      return Promise.resolve([])
    }

    return Promise.resolve([
      {
        namespace: this.chain,
        address: account.toBase58(),
        type: 'eoa'
      } as const
    ])
  }

  private getAccount<Required extends boolean>(
    required?: Required
  ): Required extends true ? PublicKey : PublicKey | undefined {
    const account = this.coinbase.publicKey
    if (required && !account) {
      throw new Error('Not connected')
    }

    return account as Required extends true ? PublicKey : PublicKey | undefined
  }
}
