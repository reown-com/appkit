/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base'

import type { CaipNetwork } from '@reown/appkit-common'
import type { Provider, RequestArguments } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'
import { sui, suiDevnet, suiTestnet } from '@reown/appkit/networks'

// Assuming sui networks are defined in @reown/appkit/networks or import from SuiConstantsUtil

import { MethodNotSupportedError } from '../errors/MethodNotSupportedError.js'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'
import type { SuiFeatures } from '../utils/wallet-standard/WalletFeatures.js'

// Define if needed

export class WalletStandardConnector extends ProviderEventEmitter {
  public readonly chain = 'sui'
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
            case 'sui:mainnet':
              return chain.caipNetworkId === sui.caipNetworkId
            case 'sui:testnet':
              return chain.caipNetworkId === suiTestnet.caipNetworkId
            case 'sui:devnet':
              return chain.caipNetworkId === suiDevnet.caipNetworkId
            default:
              return chain.caipNetworkId === chainId
          }
        })
      )
      .filter(Boolean) as CaipNetwork[]
  }

  async connect() {
    const connectFeature = this.getWalletFeature('standard:connect')
    const { accounts } = await connectFeature.connect()
    const account = accounts[0]

    if (!account) {
      throw new Error('No account found')
    }

    return account.address
  }

  async getAccountAddresses(): Promise<{ address: string; publicKey: string }[]> {
    const addresses = new Set<string>()
    const mappedAccounts = this.wallet.accounts
      .map<{ address: string; publicKey: string }>(acc => ({
        address: acc.address,
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

  async signPersonalMessage(message: Uint8Array): Promise<string> {
    const feature = this.getWalletFeature('sui:signPersonalMessage')

    const account = this.wallet.accounts[0]
    if (!account) {
      throw new Error('Account not found')
    }

    const response = await feature.signPersonalMessage({ message, account })

    if (!response) {
      throw new Error('No response from wallet')
    }

    return Buffer.from(response.signature).toString('base64')
  }

  async signTransaction(transaction: any): Promise<any> {
    const feature = this.getWalletFeature('sui:signTransaction')

    const account = this.wallet.accounts[0]
    if (!account) {
      throw new Error('Account not found')
    }

    const response = await feature.signTransaction({
      transaction,
      account,
      chain: this.chains[0].id
    })

    if (!response) {
      throw new Error('No response from wallet')
    }

    return response
  }

  // Add other methods like signAndExecuteTransaction, reportTransactionEffects

  async disconnect() {
    return Promise.resolve()
  }

  async request<T>(_args: RequestArguments): Promise<T> {
    return Promise.reject(new MethodNotSupportedError(this.id, 'request'))
  }

  private getWalletFeature<Name extends keyof SuiFeatures>(feature: Name) {
    if (!(feature in this.wallet.features)) {
      throw new MethodNotSupportedError(this.id, feature)
    }

    return this.wallet.features[feature] as WalletWithFeatures<
      Record<Name, SuiFeatures[Name]>
    >['features'][Name]
  }

  public static watchWallets({
    callback,
    requestedChains
  }: WalletStandardConnector.WatchWalletsParams) {
    const { get, on } = getWallets()

    function wrapWallets(wallets: readonly Wallet[]) {
      return wallets
        .filter(wallet => 'sui:connect' in wallet.features)
        .map(wallet => new WalletStandardConnector({ wallet, requestedChains }))
    }

    callback(...wrapWallets(get()))

    return on('register', (...wallets) => callback(...wrapWallets(wallets)))
  }

  public async switchNetwork(caipNetworkId: string): Promise<void> {
    // Implement if supported by Sui standard
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
