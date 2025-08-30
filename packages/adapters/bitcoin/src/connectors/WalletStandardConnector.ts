/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
import { getWallets } from '@wallet-standard/app'
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base'

import type { CaipNetwork } from '@reown/appkit-common'
import type { Provider, RequestArguments } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'
import type { BitcoinConnector } from '@reown/appkit-utils/bitcoin'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { MethodNotSupportedError } from '../errors/MethodNotSupportedError.js'
import { AddressPurpose } from '../utils/BitcoinConnector.js'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'
import type { BitcoinFeatures } from '../utils/wallet-standard/WalletFeatures.js'

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
    return this.wallet.icon
  }

  public get explorerId(): string | undefined {
    return PresetsUtil.ConnectorExplorerIds[this.name]
  }

  public get chains() {
    return this.wallet.chains
      .map(chainId =>
        this.requestedChains.find(chain => {
          switch (chainId) {
            case 'bitcoin:mainnet':
              return chain.caipNetworkId === bitcoin.caipNetworkId
            case 'bitcoin:testnet':
              return chain.caipNetworkId === bitcoinTestnet.caipNetworkId
            default:
              return chain.caipNetworkId === chainId
          }
        })
      )
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
    const addresses = new Set<string>()
    const mappedAccounts = this.wallet.accounts
      .map<BitcoinConnector.AccountAddress>(acc => ({
        address: acc.address,
        purpose: AddressPurpose.Payment,
        publicKey: Buffer.from(acc.publicKey).toString('hex')
      }))
      .filter(acc => {
        if (addresses.has(acc.address)) {
          return false
        }
        addresses.add(acc.address)

        return true
      })

    return Promise.resolve(mappedAccounts)
  }

  async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    if (params.protocol) {
      console.warn(
        'WalletStandardConnector:signMessage - protocol parameter not supported in WalletStandard:bitcoin - signMessage'
      )
    }

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

    return Buffer.from(response.signature).toString('base64')
  }

  async signPSBT(
    params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    const feature = this.getWalletFeature('bitcoin:signTransaction')

    if (params.broadcast) {
      throw new MethodNotSupportedError(
        this.id,
        'signPSBT',
        'This wallet does not support broadcasting, please broadcast it manually or contact the development team.'
      )
    }

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
        psbt: new Uint8Array(Buffer.from(params.psbt, 'base64')),
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

  async sendTransfer(_params: BitcoinConnector.SendTransferParams): Promise<string> {
    return Promise.reject(
      new MethodNotSupportedError(
        this.id,
        'sendTransfer',
        'Please use "signPSBT" instead and broadcast the transaction manually.'
      )
    )
  }

  async disconnect() {
    return Promise.resolve()
  }

  async request<T>(_args: RequestArguments): Promise<T> {
    return Promise.reject(new MethodNotSupportedError(this.id, 'request'))
  }

  private getWalletFeature<Name extends keyof BitcoinFeatures>(feature: Name) {
    if (!(feature in this.wallet.features)) {
      throw new MethodNotSupportedError(this.id, feature)
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

  public async switchNetwork(caipNetworkId: string): Promise<void> {
    const switchFeature = this.wallet.features['bitcoin:switchNetwork'] as
      | { switchNetwork: (caipNetworkId: string) => Promise<void> }
      | undefined

    if (switchFeature && typeof switchFeature.switchNetwork === 'function') {
      await switchFeature.switchNetwork(caipNetworkId)
      this.emit('change', { accounts: this.wallet.accounts })

      return
    }

    throw new Error(`${this.name} wallet does not support network switching`)
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
