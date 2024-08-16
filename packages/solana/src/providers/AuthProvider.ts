import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { AnyTransaction, type Provider } from '../utils/scaffold'
import { ProviderEventEmitter } from './shared/ProviderEventEmitter'
import { PublicKey } from '@solana/web3.js'

export class AuthProvider extends ProviderEventEmitter implements Provider {
  readonly name = ConstantsUtil.AUTH_CONNECTOR_ID
  readonly type = 'AUTH'

  get publicKey(): PublicKey | undefined {
    throw new Error('Method not implemented.')
  }

  get chains() {
    return []
  }

  public async connect() {
    this.emit('connect', new PublicKey('2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP'))

    return Promise.resolve('2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP')
  }

  public async disconnect() {
    this.emit('disconnect', undefined)

    return Promise.resolve()
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
}
