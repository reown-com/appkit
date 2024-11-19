import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import type { CaipNetwork } from '@reown/appkit-common'
import type { Provider } from '@reown/appkit-core'
import Wallet, {
  AddressPurpose,
  getProviders,
  type Provider as SatsConnectProvider
} from 'sats-connect'

export class SatsConnectConnector implements BitcoinConnector {
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'

  readonly wallet: SatsConnectProvider
  readonly provider: Provider
  private requestedChains: CaipNetwork[] = []

  constructor({ provider, requestedChains }: SatsConnectConnector.ConstructorParams) {
    this.provider = this as unknown as Provider
    this.wallet = provider
    this.requestedChains = requestedChains
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
    return this.requestedChains
  }

  async connect() {
    const addresses = await this.getAccountAddresses()

    if (addresses.length === 0) {
      throw new Error('No address available')
    }

    return addresses[0]?.address as string
  }

  async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    const response = await Wallet.request('getAccounts', {
      purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
      message: 'Connect to your wallet'
    })

    if (response.status === 'error') {
      throw new Error('User denied access to wallet')
    }

    if (response.result.length === 0) {
      throw new Error('No address available')
    }

    return response.result
  }

  public static getWallets({ requestedChains }: SatsConnectConnector.GetWalletsParams) {
    const providers = getProviders()

    return providers.map(provider => new SatsConnectConnector({ provider, requestedChains }))
  }

  public async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    const res = await Wallet.request('signMessage', params)

    if (res.status === 'error') {
      throw new Error('Signature denied')
    }

    return res.result.signature
  }
}

export namespace SatsConnectConnector {
  export type ConstructorParams = {
    provider: SatsConnectProvider
    requestedChains: CaipNetwork[]
  }

  export type GetWalletsParams = {
    requestedChains: CaipNetwork[]
  }
}
