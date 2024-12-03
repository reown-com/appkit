import { ConstantsUtil } from '@reown/appkit-utils'
import type {
  AnyTransaction,
  Connection,
  GetActiveChain,
  Provider
} from '@reown/appkit-utils/solana'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'
import { PublicKey, Transaction, VersionedTransaction, type SendOptions } from '@solana/web3.js'
import {
  W3mFrameProvider,
  type W3mFrameProviderMethods as ProviderAuthMethods
} from '@reown/appkit-wallet'
import { withSolanaNamespace } from '../utils/withSolanaNamespace.js'
import base58 from 'bs58'
import { isVersionedTransaction } from '@solana/wallet-adapter-base'
import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'

export type AuthProviderConfig = {
  getProvider: () => W3mFrameProvider
  getActiveChain: GetActiveChain
  getActiveNamespace: () => ChainNamespace | undefined
  getSession: () => AuthProvider.Session | undefined
  setSession: (session: AuthProvider.Session | undefined) => void
  chains: CaipNetwork[]
}

export class AuthProvider extends ProviderEventEmitter implements Provider, ProviderAuthMethods {
  public readonly name = ConstantsUtil.AUTH_CONNECTOR_ID
  public readonly type = 'AUTH'

  private readonly getProvider: AuthProviderConfig['getProvider']
  private readonly getActiveChain: AuthProviderConfig['getActiveChain']
  private readonly getActiveNamespace: AuthProviderConfig['getActiveNamespace']
  private readonly requestedChains: CaipNetwork[]
  private readonly getSession: AuthProviderConfig['getSession']
  private readonly setSession: AuthProviderConfig['setSession']

  constructor({
    getProvider,
    getActiveChain,
    getActiveNamespace,
    getSession,
    setSession,
    chains
  }: AuthProviderConfig) {
    super()

    this.getProvider = getProvider
    this.getActiveChain = getActiveChain
    this.getActiveNamespace = getActiveNamespace
    this.requestedChains = chains
    this.getSession = getSession
    this.setSession = setSession
    this.bindEvents()
  }

  get publicKey(): PublicKey | undefined {
    const session = this.getSession()
    const namespace = this.getActiveNamespace()
    if (session && namespace === 'solana') {
      return new PublicKey(session.address)
    }

    return undefined
  }

  get chains() {
    const availableChainIds = this.getProvider().getAvailableChainIds()

    return this.requestedChains.filter(requestedChain =>
      availableChainIds.includes(withSolanaNamespace(requestedChain.id) as string)
    )
  }

  public async connect() {
    const session = await this.getProvider().connect({
      chainId: withSolanaNamespace(this.getActiveChain()?.id)
    })
    this.setSession(session)

    const publicKey = this.getPublicKey(true)

    this.emit('connect', publicKey)

    return publicKey.toBase58()
  }

  public async disconnect() {
    await this.getProvider().disconnect()
    this.setSession(undefined)
    this.emit('disconnect', undefined)
  }

  public async signMessage(message: Uint8Array) {
    const result = await this.getProvider().request({
      method: 'solana_signMessage',
      params: { message: base58.encode(message), pubkey: this.getPublicKey(true).toBase58() }
    })

    return base58.decode(result.signature)
  }

  public async signTransaction<T extends AnyTransaction>(transaction: T) {
    const result = await this.getProvider().request({
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

    const result = await this.getProvider().request({
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
    const result = await this.getProvider().request({
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

  // -- W3mFrameProvider methods ------------------------------------------- //
  connectEmail: ProviderAuthMethods['connectEmail'] = args => this.getProvider().connectEmail(args)
  connectOtp: ProviderAuthMethods['connectOtp'] = args => this.getProvider().connectOtp(args)
  updateEmail: ProviderAuthMethods['updateEmail'] = args => this.getProvider().updateEmail(args)
  updateEmailPrimaryOtp: ProviderAuthMethods['updateEmailPrimaryOtp'] = args =>
    this.getProvider().updateEmailPrimaryOtp(args)
  updateEmailSecondaryOtp: ProviderAuthMethods['updateEmailSecondaryOtp'] = args =>
    this.getProvider().updateEmailSecondaryOtp(args)
  getEmail: ProviderAuthMethods['getEmail'] = () => this.getProvider().getEmail()
  getSocialRedirectUri: ProviderAuthMethods['getSocialRedirectUri'] = args =>
    this.getProvider().getSocialRedirectUri(args)
  connectDevice: ProviderAuthMethods['connectDevice'] = () => this.getProvider().connectDevice()
  connectSocial: ProviderAuthMethods['connectSocial'] = args =>
    this.getProvider().connectSocial(args)
  connectFarcaster: ProviderAuthMethods['connectFarcaster'] = () =>
    this.getProvider().connectFarcaster()
  getFarcasterUri: ProviderAuthMethods['getFarcasterUri'] = () =>
    this.getProvider().getFarcasterUri()
  syncTheme: ProviderAuthMethods['syncTheme'] = args => this.getProvider().syncTheme(args)
  syncDappData: ProviderAuthMethods['syncDappData'] = args => this.getProvider().syncDappData(args)
  switchNetwork: ProviderAuthMethods['switchNetwork'] = async args => {
    const result = await this.getProvider().switchNetwork(args)
    this.emit('chainChanged', args as string)

    return result
  }

  // -- Private ------------------------------------------- //
  private getPublicKey<Required extends boolean>(
    required?: Required
  ): Required extends true ? PublicKey : PublicKey | undefined {
    const session = this.getSession()
    if (!session) {
      if (required) {
        throw new Error('Account is required')
      }

      return undefined as Required extends true ? PublicKey : PublicKey | undefined
    }

    return new PublicKey(session.address)
  }

  private serializeTransaction(transaction: AnyTransaction) {
    return base58.encode(transaction.serialize({ verifySignatures: false }))
  }

  private bindEvents() {
    this.getProvider().onRpcRequest(request => {
      this.emit('auth_rpcRequest', request)
    })

    this.getProvider().onRpcSuccess(response => {
      this.emit('auth_rpcSuccess', response)
    })

    this.getProvider().onRpcError(error => {
      this.emit('auth_rpcError', error)
    })

    this.getProvider().onConnect(response => {
      const isSolanaNamespace =
        typeof response.chainId === 'string' ? response.chainId?.startsWith('solana') : false

      if (isSolanaNamespace) {
        this.setSession(response)
        this.emit('connect', this.getPublicKey(true))
      }
    })

    this.getProvider().onNotConnected(() => {
      this.emit('disconnect', undefined)
    })
  }
}

export namespace AuthProvider {
  export type Session = Awaited<ReturnType<W3mFrameProvider['connect']>>
}
