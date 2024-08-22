import { ConstantsUtil } from '@web3modal/scaffold-utils'
import type {
  AnyTransaction,
  Chain,
  Connection,
  GetActiveChain,
  Provider
} from '@web3modal/scaffold-utils/solana'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter.js'
import { PublicKey, Transaction, VersionedTransaction, type SendOptions } from '@solana/web3.js'
import {
  W3mFrameProvider,
  type W3mFrameProviderMethods as ProviderAuthMethods
} from '@web3modal/wallet'
import { withSolanaNamespace } from '../utils/withSolanaNamespace.js'
import base58 from 'bs58'
import { isVersionedTransaction } from '@solana/wallet-adapter-base'

export type AuthProviderConfig = {
  provider: W3mFrameProvider
  getActiveChain: GetActiveChain
  auth: NonNullable<Provider['auth']>
  chains: Chain[]
}

export class AuthProvider extends ProviderEventEmitter implements Provider, ProviderAuthMethods {
  public readonly name = ConstantsUtil.AUTH_CONNECTOR_ID
  public readonly type = 'AUTH'
  public readonly auth: AuthProviderConfig['auth']

  private readonly provider: AuthProviderConfig['provider']
  private readonly getActiveChain: AuthProviderConfig['getActiveChain']
  private readonly requestedChains: Chain[]

  private session: AuthProvider.Session | undefined

  constructor({ provider, getActiveChain, auth, chains }: AuthProviderConfig) {
    super()

    this.provider = provider
    this.getActiveChain = getActiveChain
    this.auth = auth
    this.requestedChains = chains

    this.bindEvents()
  }

  get publicKey(): PublicKey | undefined {
    if (this.session) {
      return new PublicKey(this.session.address)
    }

    return undefined
  }

  get chains() {
    const availableChainIds = this.provider.getAvailableChainIds()

    return this.requestedChains.filter(requestedChain =>
      availableChainIds.includes(withSolanaNamespace(requestedChain.chainId))
    )
  }

  public async connect() {
    this.session = await this.provider.connect({
      chainId: withSolanaNamespace(this.getActiveChain()?.chainId)
    })

    const publicKey = this.getPublicKey(true)

    this.emit('connect', publicKey)

    return publicKey.toBase58()
  }

  public async disconnect() {
    await this.provider.disconnect()

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

  // -- W3mFrameProvider methods ------------------------------------------- //
  connectEmail: ProviderAuthMethods['connectEmail'] = args => this.provider.connectEmail(args)
  connectOtp: ProviderAuthMethods['connectOtp'] = args => this.provider.connectOtp(args)
  updateEmail: ProviderAuthMethods['updateEmail'] = args => this.provider.updateEmail(args)
  updateEmailPrimaryOtp: ProviderAuthMethods['updateEmailPrimaryOtp'] = args =>
    this.provider.updateEmailPrimaryOtp(args)
  updateEmailSecondaryOtp: ProviderAuthMethods['updateEmailSecondaryOtp'] = args =>
    this.provider.updateEmailSecondaryOtp(args)
  getEmail: ProviderAuthMethods['getEmail'] = () => this.provider.getEmail()
  getSocialRedirectUri: ProviderAuthMethods['getSocialRedirectUri'] = args =>
    this.provider.getSocialRedirectUri(args)
  connectDevice: ProviderAuthMethods['connectDevice'] = () => this.provider.connectDevice()
  connectSocial: ProviderAuthMethods['connectSocial'] = args => this.provider.connectSocial(args)
  connectFarcaster: ProviderAuthMethods['connectFarcaster'] = () => this.provider.connectFarcaster()
  getFarcasterUri: ProviderAuthMethods['getFarcasterUri'] = () => this.provider.getFarcasterUri()
  syncTheme: ProviderAuthMethods['syncTheme'] = args => this.provider.syncTheme(args)
  syncDappData: ProviderAuthMethods['syncDappData'] = args => this.provider.syncDappData(args)
  switchNetwork: ProviderAuthMethods['switchNetwork'] = async args => {
    const result = await this.provider.switchNetwork(args)
    this.emit('chainChanged', args as string)

    return result
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

    this.provider.onIsConnected(response => {
      this.session = response
      this.emit('connect', this.getPublicKey(true))
    })

    this.provider.onNotConnected(() => {
      this.emit('disconnect', undefined)
    })
  }
}

export namespace AuthProvider {
  export type Session = Awaited<ReturnType<W3mFrameProvider['connect']>>
}
