import { isVersionedTransaction } from '@solana/wallet-adapter-base'
import { PublicKey, type SendOptions, Transaction, VersionedTransaction } from '@solana/web3.js'
import base58 from 'bs58'

import type { CaipNetwork } from '@reown/appkit-common'
import { ConstantsUtil } from '@reown/appkit-common'
import { OptionsController, type RequestArguments } from '@reown/appkit-controllers'
import type {
  AnyTransaction,
  Connection,
  GetActiveChain,
  Provider as SolanaProvider
} from '@reown/appkit-utils/solana'
import { W3mFrameProvider } from '@reown/appkit-wallet'

import { withSolanaNamespace } from '../utils/withSolanaNamespace.js'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'

export class AuthProvider extends ProviderEventEmitter implements SolanaProvider {
  public readonly id = ConstantsUtil.CONNECTOR_ID.AUTH
  public readonly name = ConstantsUtil.CONNECTOR_NAMES.AUTH
  public readonly type = 'AUTH'
  public readonly chain = ConstantsUtil.CHAIN.SOLANA
  public readonly provider: W3mFrameProvider

  private readonly requestedChains: CaipNetwork[]
  private readonly getActiveChain: GetActiveChain

  constructor(params: AuthProvider.ConstructorParams) {
    super()

    this.provider = params.w3mFrameProvider
    this.requestedChains = params.chains
    this.getActiveChain = params.getActiveChain
  }

  get publicKey(): PublicKey | undefined {
    const address = this.provider.user?.address

    return address ? new PublicKey(address) : undefined
  }

  get chains() {
    const availableChainIds = this.provider.getAvailableChainIds()

    return this.requestedChains.filter(requestedChain =>
      availableChainIds.includes(requestedChain.caipNetworkId)
    )
  }

  public async connect(params: { chainId?: string } = {}) {
    const chainId = params.chainId || this.getActiveChain()?.id
    await this.provider.connect({
      chainId: withSolanaNamespace(chainId),
      preferredAccountType: OptionsController.state.defaultAccountTypes.solana
    })

    if (!this.publicKey) {
      throw new Error('Failed to connect to the wallet')
    }

    this.emit('connect', this.publicKey)

    return this.publicKey.toBase58()
  }

  public async disconnect() {
    await this.provider.disconnect()
    this.emit('disconnect', undefined)
  }

  public async signMessage(message: Uint8Array) {
    if (!this.publicKey) {
      throw new Error('Wallet not connected')
    }

    const result = await this.provider.request({
      method: 'solana_signMessage',
      params: { message: base58.encode(message), pubkey: this.publicKey.toBase58() }
    })

    return base58.decode(result.signature)
  }

  public async signTransaction<T extends AnyTransaction>(transaction: T) {
    const result = await this.provider.request({
      method: 'solana_signTransaction',
      params: { transaction: this.serializeTransaction(transaction) }
    })

    const decodedTransaction = base58.decode(result.transaction)

    if (isVersionedTransaction(transaction)) {
      return VersionedTransaction.deserialize(decodedTransaction) as T
    }

    return Transaction.from(decodedTransaction) as T
  }

  public async signAndSendTransaction<T extends AnyTransaction>(
    transaction: T,
    options?: SendOptions
  ) {
    const serializedTransaction = this.serializeTransaction(transaction)

    const result = await this.provider.request({
      method: 'solana_signAndSendTransaction',
      params: {
        transaction: serializedTransaction,
        options
      }
    })

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
    const result = await this.provider.request({
      method: 'solana_signAllTransactions',
      params: {
        transactions: transactions.map(transaction => this.serializeTransaction(transaction))
      }
    })

    return (result.transactions as string[]).map((encodedTransaction, index) => {
      const transaction = transactions[index]

      if (!transaction) {
        throw new Error('Invalid solana_signAllTransactions response')
      }

      const decodedTransaction = base58.decode(encodedTransaction)

      if (isVersionedTransaction(transaction)) {
        return VersionedTransaction.deserialize(decodedTransaction)
      }

      return Transaction.from(decodedTransaction)
    }) as T
  }

  public async request<T>(args: RequestArguments): Promise<T> {
    // @ts-expect-error - There is a miss match in `args` from CoreProvider and W3mFrameProvider
    return this.provider.request({ method: args.method, params: args.params })
  }

  public async getAccounts() {
    if (!this.publicKey) {
      return Promise.resolve([])
    }

    return Promise.resolve([
      {
        namespace: this.chain,
        address: this.publicKey.toBase58(),
        type: 'eoa'
      } as const
    ])
  }

  // -- Private ------------------------------------------- //
  private serializeTransaction(transaction: AnyTransaction) {
    return base58.encode(new Uint8Array(transaction.serialize({ verifySignatures: false })))
  }
}

export namespace AuthProvider {
  export type ConstructorParams = {
    w3mFrameProvider: W3mFrameProvider
    getActiveChain: GetActiveChain
    chains: CaipNetwork[]
  }

  export type Session = Awaited<ReturnType<W3mFrameProvider['connect']>>
}
