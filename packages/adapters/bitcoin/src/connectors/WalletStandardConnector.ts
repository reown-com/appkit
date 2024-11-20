import { getWallets } from '@wallet-standard/app'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base'
import type { CaipNetwork } from '@reown/appkit-common'
import type { BitcoinFeatures } from '@exodus/bitcoin-wallet-standard'
import type { Provider, RequestArguments } from '@reown/appkit-core'

export class WalletStandardConnector implements BitcoinConnector {
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'
  provider: Provider

  readonly wallet: Wallet
  private requestedChains: CaipNetwork[] = []

  constructor({ wallet, requestedChains }: WalletStandardConnector.ConstructorParams) {
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

  async signMessage(_params: { address: string; message: string }): Promise<string> {
    return Promise.resolve('signature')
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

  sendTransfer(params: { address: string; amount: string; recipient: string }): Promise<string> {
    console.log('sendTransfer', params)

    return Promise.resolve('txid')
  }

  on<
    T extends keyof {
      connect: (connectParams: { chainId: number }) => void
      disconnect: (error: Error) => void
      display_uri: (uri: string) => void
      chainChanged: (chainId: string) => void
      accountsChanged: (accounts: string[]) => void
      message: (message: { type: string; data: unknown }) => void
    }
  >(
    event: T,
    listener: {
      connect: (connectParams: { chainId: number }) => void
      disconnect: (error: Error) => void
      display_uri: (uri: string) => void
      chainChanged: (chainId: string) => void
      accountsChanged: (accounts: string[]) => void
      message: (message: { type: string; data: unknown }) => void
    }[T]
  ): void {
    console.log(event, listener)
    throw new Error('Method not implemented.')
  }

  removeListener<T>(event: string, listener: (data: T) => void) {
    console.log(event, listener)
    throw new Error('Method not implemented.')
  }

  async disconnect() {
    console.log('disconnect')

    return Promise.resolve()
  }

  async request<T>(args: RequestArguments) {
    console.log('request', args)

    return Promise.reject(new Error('Method not implemented.'))
  }

  emit() {
    throw new Error('Method not implemented.')
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
