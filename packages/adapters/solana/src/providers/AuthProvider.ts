import type {
  AnyTransaction,
  Connection,
  GetActiveChain,
  Provider as SolanaProvider
} from '@reown/appkit-utils/solana'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'
import { PublicKey, Transaction, VersionedTransaction, type SendOptions } from '@solana/web3.js'
import { W3mFrameProvider } from '@reown/appkit-wallet'
import { withSolanaNamespace } from '../utils/withSolanaNamespace.js'
import base58 from 'bs58'
import { isVersionedTransaction } from '@solana/wallet-adapter-base'
import type { CaipNetwork, CaipNetworkId } from '@reown/appkit-common'
import { ConstantsUtil } from '@reown/appkit-common'
import type { RequestArguments } from '@reown/appkit-core'

export class AuthProvider extends ProviderEventEmitter implements SolanaProvider {
  public readonly id = ConstantsUtil.CONNECTOR_ID.AUTH
  public readonly name = ConstantsUtil.CONNECTOR_ID.AUTH
  public readonly type = 'AUTH'
  public readonly chain = ConstantsUtil.CHAIN.SOLANA
  public readonly provider: W3mFrameProvider

  private readonly requestedChains: CaipNetwork[]
  private readonly getActiveChain: GetActiveChain

  private session: AuthProvider.Session | undefined

  constructor(params: AuthProvider.ConstructorParams) {
    super()

    this.provider = params.w3mFrameProvider
    this.requestedChains = params.chains
    this.getActiveChain = params.getActiveChain

    this.bindEvents()
  }

  get publicKey(): PublicKey | undefined {
    return this.getPublicKey(false)
  }

  get chains() {
    const availableChainIds = this.provider.getAvailableChainIds()

    return this.requestedChains.filter(requestedChain =>
      availableChainIds.includes(withSolanaNamespace(requestedChain.id) as string)
    )
  }

  public async connect() {
    const session = await this.provider.connect({
      chainId: withSolanaNamespace(this.getActiveChain()?.id)
    })

    this.session = session

    const publicKey = this.getPublicKey(true)

    this.emit('connect', publicKey)

    return publicKey.toBase58()
  }

  public async disconnect() {
    await this.provider.disconnect()
    this.session = undefined
    this.emit('disconnect', undefined)
  }

  public async signMessage(message: Uint8Array) {
    const result = await this.provider.request({
      method: 'solana_signMessage',
      params: { message: base58.encode(message), pubkey: this.getPublicKey(true).toBase58() }
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

  public async switchNetwork(chainId: CaipNetworkId) {
    const switchNetworkResponse = await this.provider.switchNetwork(chainId)
    const user = await this.provider.getUser({ chainId: switchNetworkResponse.chainId })
    this.session = user
    this.emit('chainChanged', chainId)

    return user
  }

  public async getAccounts() {
    if (!this.session) {
      return Promise.resolve([])
    }

    return Promise.resolve([
      {
        namespace: this.chain,
        address: this.session.address,
        type: 'eoa'
      } as const
    ])
  }

  // -- Private ------------------------------------------- //
  private getPublicKey<Required extends boolean>(
    required?: Required
  ): Required extends true ? PublicKey : PublicKey | undefined {
    if (!this.session) {
      if (required) {
        throw new Error('Account is required')
      }

      return undefined as Required extends true ? PublicKey : PublicKey | undefined
    }

    return new PublicKey(this.session.address)
  }

  private serializeTransaction(transaction: AnyTransaction) {
    return base58.encode(transaction.serialize({ verifySignatures: false }))
  }

  private bindEvents() {
    this.provider.onRpcRequest(request => {
      this.emit('auth_rpcRequest', request)
    })

    this.provider.onRpcSuccess(response => {
      this.emit('auth_rpcSuccess', response)
    })

    this.provider.onRpcError(error => {
      this.emit('auth_rpcError', error)
    })

    this.provider.onNotConnected(() => {
      this.emit('disconnect', undefined)
    })
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
