import { getWallets } from '@wallet-standard/app'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base'
import type { CaipNetwork } from '@reown/appkit-common'
import type { BitcoinFeatures } from '../utils/wallet-standard/WalletFeatures.js'
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
    const feature = this.getWalletFeature('bitcoin:signMessage')

    const account = this.wallet.accounts.find(acc => acc.address === params.address)

    if (!account) {
      throw new Error('Account not found')
    }

    const message = new TextEncoder().encode(params.message)
    const response = (await feature.signMessage({ account, message }))[0]

    if (!response) {
      throw new Error('No response from wallet')
    }

    // Should it be base64 encoded?
    return Buffer.from(response.signature).toString('base64')
  }

  async signPSBT(
    params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    const feature = this.getWalletFeature('bitcoin:signTransaction')

    const inputsToSign = params.signInputs.map(input => {
      const account = this.wallet.accounts.find(acc => acc.address === input.address)

      if (!account) {
        throw new Error(`Account with address ${input.address} not found`)
      }

      return {
        account,
        signingIndexes: [input.index],
        sigHash: undefined
      }
    })

    const response = (
      await feature.signTransaction({
        psbt: Buffer.from(params.psbt, 'base64'),
        inputsToSign
      })
    )[0]

    if (!response) {
      throw new Error('No response from wallet')
    }

    return {
      psbt: Buffer.from(response.signedPsbt).toString('base64'),
      txid: undefined
    }
  }

  sendTransfer(_params: BitcoinConnector.SendTransferParams): Promise<string> {
    throw new Error(`The wallet doesn't support "sendTransfer" method`)
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
