import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { type AnyTransaction, type GetActiveChain, type Provider } from '../utils/scaffold'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter'
import { PublicKey } from '@solana/web3.js'
import type { W3mFrameProvider } from '@web3modal/wallet'
import { withSolanaNamespace } from '../utils/withSolanaNamespace'

export type AuthProviderConfig = {
  provider: W3mFrameProvider
  getActiveChain: GetActiveChain
  auth: NonNullable<Provider['auth']>
}

export class AuthProvider extends ProviderEventEmitter implements Provider {
  public readonly name = ConstantsUtil.AUTH_CONNECTOR_ID
  public readonly type = 'AUTH'
  public readonly auth: AuthProviderConfig['auth']

  private readonly provider: AuthProviderConfig['provider']
  private readonly getActiveChain: AuthProviderConfig['getActiveChain']

  private session: AuthProvider.Session | undefined

  constructor({ provider, getActiveChain, auth }: AuthProviderConfig) {
    super()

    this.provider = provider
    this.getActiveChain = getActiveChain
    this.auth = auth
  }

  get publicKey(): PublicKey | undefined {
    if (this.session) {
      return new PublicKey(this.session.address)
    }

    return undefined
  }

  get chains() {
    return []
  }

  public async connect() {
    this.session = await this.provider.connect({
      chainId: withSolanaNamespace(this.getActiveChain()?.chainId)
    })

    const publicKey = this.getPublicKey(true)

    this.emit('connect', publicKey)

    return publicKey.toBase58()
  }

  public connectEmail = this.provider.connectEmail

  public async disconnect() {
    await this.provider.disconnect()

    this.emit('disconnect', undefined)
  }

  public async signMessage(_message: Uint8Array) {
    return Promise.resolve(new Uint8Array())
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
}

export namespace AuthProvider {
  export type Session = Awaited<ReturnType<W3mFrameProvider['connect']>>
}
