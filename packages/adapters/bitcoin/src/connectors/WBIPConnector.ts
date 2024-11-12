import type { CaipNetwork } from '@reown/appkit-common'
import type { BitcoinConnector } from '../utils/BitcoinConnector.js'

export class WBIPConnector implements BitcoinConnector {
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'

  readonly wallet: WBIPConnector.Provider
  private requestedChains: CaipNetwork[] = []

  constructor({ provider, requestedChains }: WBIPConnector.ConstructorParams) {
    this.wallet = provider
    this.requestedChains = requestedChains
  }

  public get id(): string {
    return this.wallet.id
  }

  public get name(): string {
    return this.wallet.name
  }

  public get imageUrl(): string {
    return this.wallet.icon
  }

  public get chains() {
    return this.requestedChains
  }

  async connect() {
    const addresses = await this.getAccountAddresses()
    const address = addresses[0]?.address
    if (!address) {
      throw new Error('No address available')
    }

    return address
  }

  async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    return (await this.request('getAddresses', {})).addresses
  }

  private async request<Method extends WBIPConnector.Methods>(
    method: Method,
    params: WBIPConnector.Requests[Method]['params']
  ): Promise<WBIPConnector.Requests[Method]['response']> {
    if (!this.wallet.methods?.includes(method)) {
      throw new Error(`Method ${method} is not available for wallet ${this.wallet.id}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walletRequest = (window as any)[this.wallet.id]?.request
    if (typeof walletRequest !== 'function') {
      throw new Error(`Wallet ${this.wallet.id} is not available`)
    }

    const response = await walletRequest(method, params)

    return response.result
  }

  public static getWallets({ requestedChains }: WBIPConnector.GetWalletsParams) {
    const providers: WBIPConnector.Provider[] =
      (window as Window & { btc_providers?: WBIPConnector.Provider[] }).btc_providers || []

    return providers.map(provider => new WBIPConnector({ provider, requestedChains }))
  }
}

export namespace WBIPConnector {
  export interface ConstructorParams {
    provider: WBIPConnector.Provider
    requestedChains: CaipNetwork[]
  }

  export interface Provider {
    id: string
    name: string
    icon: string

    webUrl?: string

    chromeWebStoreUrl?: string
    mozillaAddOnsUrl?: string
    googlePlayStoreUrl?: string
    iOSAppStoreUrl?: string

    methods?: string[]
  }

  export interface GetWalletsParams {
    requestedChains: CaipNetwork[]
  }

  export type Request<Params, Response> = {
    params: Params
    response: Response
  }

  export type Requests = {
    getAddresses: Request<
      {
        types?: string[]
        intentions?: string[]
        count?: number
      },
      {
        addresses: {
          address: string
          path?: string
          publicKey?: string
          intention?: 'payment' | 'ordinal'
        }[]
      }
    >
  }

  export type Methods = keyof Requests
}
