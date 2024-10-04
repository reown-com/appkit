import { type AnyTransaction, type Provider } from '@reown/appkit-utils/solana'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'
import type { Connection, PublicKey, SendOptions } from '@solana/web3.js'
import type { CaipNetwork } from '@reown/appkit-common'
import { solana } from '@reown/appkit/networks'

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

export class CoinbaseWalletProvider extends ProviderEventEmitter implements Provider {
  public readonly name = 'Coinbase Wallet'
  public readonly type = 'ANNOUNCED'
  public readonly icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSI1MTIiIGN5PSI1MTIiIHI9IjUxMiIgZmlsbD0iIzAwNTJGRiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1MiA1MTJDMTUyIDcxMC44MjMgMzEzLjE3NyA4NzIgNTEyIDg3MkM3MTAuODIzIDg3MiA4NzIgNzEwLjgyMyA4NzIgNTEyQzg3MiAzMTMuMTc3IDcxMC44MjMgMTUyIDUxMiAxNTJDMzEzLjE3NyAxNTIgMTUyIDMxMy4xNzcgMTUyIDUxMlpNNDIwIDM5NkM0MDYuNzQ1IDM5NiAzOTYgNDA2Ljc0NSAzOTYgNDIwVjYwNEMzOTYgNjE3LjI1NSA0MDYuNzQ1IDYyOCA0MjAgNjI4SDYwNEM2MTcuMjU1IDYyOCA2MjggNjE3LjI1NSA2MjggNjA0VjQyMEM2MjggNDA2Ljc0NSA2MTcuMjU1IDM5NiA2MDQgMzk2SDQyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='

  private provider: SolanaCoinbaseWallet
  private requestedChains: CaipNetwork[]

  constructor(params: CoinbaseWalletProviderConfig) {
    super()
    this.provider = params.provider
    this.requestedChains = params.chains
  }

  public get chains() {
    // For Coinbase Wallet, we only support the Solana mainnet
    return this.requestedChains.filter(chain => chain.id === solana.id)
  }

  public get publicKey() {
    return this.provider.publicKey
  }

  public async connect() {
    try {
      await this.provider.connect()
      const account = this.getAccount(true)
      this.provider.emit('connect', this.provider.publicKey)
      this.emit('connect', account)

      return account.toBase58()
    } catch (error) {
      this.provider.emit('error', error)
      throw error
    }
  }

  public async disconnect() {
    await this.provider.disconnect()
    this.provider.emit('disconnect', undefined)
    this.emit('disconnect', undefined)
  }

  public async signMessage(message: Uint8Array) {
    const result = await this.provider.signMessage(message)

    return result.signature
  }

  public async signTransaction<T extends AnyTransaction>(transaction: T) {
    return this.provider.signTransaction(transaction)
  }

  public async signAndSendTransaction<T extends AnyTransaction>(
    transaction: T,
    sendOptions?: SendOptions
  ) {
    const result = await this.provider.signAndSendTransaction(transaction, sendOptions)

    return result.signature
  }

  public async sendTransaction(
    transaction: AnyTransaction,
    connection: Connection,
    options?: SendOptions
  ) {
    const signedTransaction = await this.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), options)

    return signature
  }

  public async signAllTransactions<T extends AnyTransaction[]>(transactions: T): Promise<T> {
    return (await this.provider.signAllTransactions(transactions)) as T
  }

  private getAccount<Required extends boolean>(
    required?: Required
  ): Required extends true ? PublicKey : PublicKey | undefined {
    const account = this.provider.publicKey
    if (required && !account) {
      throw new Error('Not connected')
    }

    return account as Required extends true ? PublicKey : PublicKey | undefined
  }
}
