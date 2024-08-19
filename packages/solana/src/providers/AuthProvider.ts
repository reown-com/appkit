import { ConstantsUtil } from '@web3modal/scaffold-utils'
import {
  type AnyTransaction,
  type Chain,
  type GetActiveChain,
  type Provider,
  type ProviderAuthMethods
} from '../utils/scaffold'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter'
import { PublicKey } from '@solana/web3.js'
import { W3mFrameProvider } from '@web3modal/wallet'
import { withSolanaNamespace } from '../utils/withSolanaNamespace'
import base58 from 'bs58'

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
    this.bindEvents()

    return publicKey.toBase58()
  }

  public async disconnect() {
    await this.provider.disconnect()

    this.emit('disconnect', undefined)
  }

  public async signMessage(message: Uint8Array) {
    const response = await this.provider.request({
      method: 'solana_signMessage',
      params: { message: base58.encode(message), pubkey: this.getPublicKey(true).toBase58() }
    })

    return base58.decode(response.signature)
  }

  public async signTransaction<T extends AnyTransaction>(_transaction: T) {
    return Promise.resolve(_transaction)
  }

  public async signAndSendTransaction(_transaction: AnyTransaction) {
    return Promise.resolve('')
  }

  public async signAllTransactions(_transactions: AnyTransaction[]) {
    return Promise.resolve([])
  }

  public async sendTransaction(_transaction: AnyTransaction) {
    return Promise.resolve('')
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
  connectDevice: ProviderAuthMethods['connectDevice'] = () => this.provider.connectDevice()
  connectSocial: ProviderAuthMethods['connectSocial'] = args => this.provider.connectSocial(args)
  connectFarcaster: ProviderAuthMethods['connectFarcaster'] = () => this.provider.connectFarcaster()
  getFarcasterUri: ProviderAuthMethods['getFarcasterUri'] = () => this.provider.getFarcasterUri()
  syncTheme: ProviderAuthMethods['syncTheme'] = args => this.provider.syncTheme(args)
  syncDappData: ProviderAuthMethods['syncDappData'] = args => this.provider.syncDappData(args)

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
