import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import type { CaipNetwork } from '@reown/appkit-common'
import {
  AddressPurpose,
  getProviders,
  getProviderById,
  type BtcRequestMethod,
  type BtcRequests,
  type Params,
  type Provider as SatsConnectProvider,
  type BitcoinProvider,
  type Requests as SatsConnectRequests
} from 'sats-connect'
import type { RequestArguments } from '@reown/appkit-core'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'

export class SatsConnectConnector extends ProviderEventEmitter implements BitcoinConnector {
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'

  readonly wallet: SatsConnectProvider
  readonly provider: BitcoinConnector

  private requestedChains: CaipNetwork[] = []

  constructor({ provider, requestedChains }: SatsConnectConnector.ConstructorParams) {
    super()
    this.wallet = provider
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

  public get chains() {
    return this.requestedChains
  }

  async disconnect() {
    await this.internalRequest('wallet_disconnect', null)
  }

  async request<T>(args: RequestArguments) {
    return this.internalRequest(
      args.method as BtcRequestMethod,
      args.params as Params<BtcRequests>
    ) as Promise<T>
  }

  async connect() {
    const address = await this.getAccountAddresses()
      .then(addresses => addresses[0]?.address)
      .catch(() =>
        this.internalRequest('wallet_connect', null).then(
          response => response.addresses.find(a => a.purpose === AddressPurpose.Payment)?.address
        )
      )

    if (!address) {
      throw new Error('No address available')
    }

    return address
  }

  async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    const response = await this.internalRequest('getAddresses', {
      purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
      message: 'Connect to your wallet'
    })

    return response.addresses
  }

  public static getWallets({ requestedChains }: SatsConnectConnector.GetWalletsParams) {
    const providers = getProviders()

    return providers.map(provider => new SatsConnectConnector({ provider, requestedChains }))
  }

  public async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    const res = await this.internalRequest('signMessage', params)

    return res.signature
  }

  public async signPSBT(
    params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    const signInputs = params.signInputs.reduce<Record<string, number[]>>((acc, input) => {
      const currentIndexes = acc[input.address] || []
      currentIndexes.push(input.index)

      return { ...acc, [input.address]: currentIndexes }
    }, {})

    const res = await this.internalRequest('signPsbt', {
      psbt: params.psbt,
      broadcast: params.broadcast,
      signInputs
    })

    return res
  }

  public async sendTransfer({
    amount,
    recipient
  }: BitcoinConnector.SendTransferParams): Promise<string> {
    const parsedAmount = Number(amount)

    if (isNaN(parsedAmount)) {
      throw new Error('Invalid amount')
    }

    const res = await this.internalRequest('sendTransfer', {
      recipients: [{ address: recipient, amount: parsedAmount }]
    })

    return res.txid
  }

  private getWalletProvider() {
    return getProviderById(this.wallet.id) as BitcoinProvider
  }

  private async internalRequest<Method extends keyof SatsConnectRequests>(
    method: Method,
    options: Params<Method>
  ) {
    const response = await this.getWalletProvider().request(method, options)

    if ('result' in response) {
      return response.result
    }

    throw new Error(response.error.message)
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
