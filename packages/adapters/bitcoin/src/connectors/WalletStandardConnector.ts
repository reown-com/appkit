import { getWallets } from '@wallet-standard/app'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base'
import type { CaipNetwork } from '@reown/appkit-common'
import type { BitcoinFeatures } from '@exodus/bitcoin-wallet-standard'
import type { Provider, RequestArguments } from '@reown/appkit-core'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'

export class WalletStandardConnector extends ProviderEventEmitter implements BitcoinConnector {
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'

  readonly provider: Provider
  readonly wallet: Wallet
  private requestedChains: CaipNetwork[] = []

  constructor({ wallet, requestedChains }: WalletStandardConnector.ConstructorParams) {
    super()
    this.provider = this
    this.wallet = wallet
    this.requestedChains = requestedChains
    this.provider = this
  }

  public get id(): string {
    return this.name
  }

  public get name(): string {
    return this.wallet.name
  }

  public get imageUrl(): string {
    return this.wallet.icon || ''
  }

  public get chains() {
    return this.wallet.chains
      .map(chainId => this.requestedChains.find(chain => chain.id === chainId))
      .filter(Boolean) as CaipNetwork[]
  }

  async connect() {
    const connectFeature = this.getWalletFeature('bitcoin:connect')
    const response = await connectFeature.connect({ purposes: ['payment', 'ordinals'] })

    const account = response.accounts[0]
    if (!account) {
      throw new Error('No account found')
    }

    return account.address
  }

  async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    return Promise.resolve([])
  }

  async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    // BitcoinWalletStandard package is not exposing the signMessage feature
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const feature = this.getWalletFeature('bitcoin:signMessage' as any)

    const account = this.wallet.accounts.find(acc => acc.address === params.address)
    const message = new TextEncoder().encode(params.message)
    const response = (await feature.signMessage({ account, message }))[0]

    // Should it be base64 encoded?
    return Buffer.from(response.signature).toString('base64')
  }

  async signPSBT(
    _params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    return Promise.reject(new Error('Method not implemented.'))
  }

  async sendTransfer(_params: BitcoinConnector.SendTransferParams): Promise<string> {
    return Promise.resolve('txid')
  }

  async disconnect() {
    return Promise.resolve()
  }

  async request<T>(_args: RequestArguments): Promise<T> {
    return Promise.reject(new Error('Method not implemented.'))
  }

  private getWalletFeature<Name extends keyof BitcoinFeatures>(feature: Name) {
    if (!(feature in this.wallet.features)) {
      throw new Error('Wallet does not support feature')
    }

    return this.wallet.features[feature] as WalletWithFeatures<
      Record<Name, BitcoinFeatures[Name]>
    >['features'][Name]
  }

  public static watchWallets({
    callback,
    requestedChains
  }: WalletStandardConnector.WatchWalletsParams) {
    const { get, on } = getWallets()

    function wrapWallets(wallets: readonly Wallet[]) {
      // Must replace the filter with the correct function to identify bitcoin wallets
      return wallets
        .filter(wallet => 'bitcoin:connect' in wallet.features)
        .map(wallet => new WalletStandardConnector({ wallet, requestedChains }))
    }

    callback(...wrapWallets(get()))

    return on('register', (...wallets) => callback(...wrapWallets(wallets)))
  }
}

export namespace WalletStandardConnector {
  export type ConstructorParams = {
    wallet: Wallet
    requestedChains: CaipNetwork[]
  }

  export type WatchWalletsParams = {
    callback: (...connectors: WalletStandardConnector[]) => void
    requestedChains: CaipNetwork[]
  }
}
