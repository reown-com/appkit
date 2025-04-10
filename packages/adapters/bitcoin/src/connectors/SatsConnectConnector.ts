import {
  AddressPurpose,
  BitcoinNetworkType,
  type BitcoinProvider,
  type BtcRequestMethod,
  type BtcRequests,
  MessageSigningProtocols,
  type Params,
  type RpcErrorResponse,
  type RpcSuccessResponse,
  type Provider as SatsConnectProvider,
  type Requests as SatsConnectRequests,
  getProviderById,
  getProviders
} from 'sats-connect'

import type { CaipNetwork } from '@reown/appkit-common'
import { CoreHelperUtil } from '@reown/appkit-controllers'
import type { RequestArguments } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'

import type { BitcoinConnector } from '../utils/BitcoinConnector.js'
import { mapCaipNetworkToXverseName, mapXverseNameToCaipNetwork } from '../utils/HelperUtil.js'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'

export class SatsConnectConnector extends ProviderEventEmitter implements BitcoinConnector {
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'

  readonly wallet: SatsConnectProvider
  readonly provider: BitcoinConnector
  readonly requestedChains: CaipNetwork[] = []
  readonly getActiveNetwork: () => CaipNetwork | undefined

  private walletUnsubscribes: (() => void)[] = []

  constructor({
    provider,
    requestedChains,
    getActiveNetwork
  }: SatsConnectConnector.ConstructorParams) {
    super()
    this.wallet = provider
    this.requestedChains = requestedChains
    this.provider = this
    this.getActiveNetwork = getActiveNetwork
  }

  public get id(): string {
    return this.name
  }

  public get name(): string {
    return this.wallet.name
  }

  public get explorerId(): string | undefined {
    return PresetsUtil.ConnectorExplorerIds[this.wallet.name]
  }

  public get imageUrl(): string {
    return this.wallet.icon
  }

  public get chains() {
    return this.requestedChains.filter(chain => chain.chainNamespace === 'bip122')
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
          response => response?.addresses?.find(a => a?.purpose === AddressPurpose.Payment)?.address
        )
      )

    if (!address) {
      throw new Error('No address available')
    }

    this.bindEvents()

    return address
  }

  async disconnect() {
    await this.internalRequest('wallet_disconnect', null)
    this.unbindEvents()
  }

  async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    const response = await this.internalRequest('getAddresses', {
      purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals, AddressPurpose.Stacks],
      message: 'Connect to your wallet'
    })

    if (response.addresses.length === 0) {
      throw new Error('No address available')
    }

    return response.addresses as BitcoinConnector.AccountAddress[]
  }

  public static getWallets({
    requestedChains,
    getActiveNetwork
  }: SatsConnectConnector.GetWalletsParams) {
    if (!CoreHelperUtil.isClient()) {
      return []
    }

    const providers = getProviders()

    return providers.map(
      provider => new SatsConnectConnector({ provider, requestedChains, getActiveNetwork })
    )
  }

  public async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    const protocol = params.protocol?.toUpperCase() as MessageSigningProtocols
    const res = await this.internalRequest('signMessage', { ...params, protocol })

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

  public async switchNetwork(caipNetworkId: string): Promise<void> {
    const networkName = mapCaipNetworkToXverseName(caipNetworkId)
    await this.internalRequest('wallet_changeNetwork', { name: networkName })
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

  protected getWalletProvider() {
    return getProviderById(this.wallet.id) as BitcoinProvider
  }

  protected async internalRequest<Method extends keyof SatsConnectRequests>(
    method: Method,
    options: Params<Method>
  ): Promise<RpcSuccessResponse<Method>['result']> {
    const response = await this.getWalletProvider()
      .request(method, options)
      .catch(error => {
        if ('jsonrpc' in error && 'error' in error) {
          return error as RpcErrorResponse
        }

        throw error
      })

    if ('result' in response) {
      return response.result
    }

    throw { ...response.error, name: 'RPCError' } as Error
  }

  private bindEvents() {
    this.unbindEvents()

    const provider = this.getWalletProvider()

    if (typeof provider.addListener !== 'function') {
      console.warn(
        `SatsConnectConnector:bindEvents - wallet provider "${this.name}" does not support events`
      )

      return
    }

    this.walletUnsubscribes.push(
      provider.addListener('accountChange', async _data => {
        const address = await this.connect()
        this.emit('accountsChanged', [address])
      }),

      provider.addListener('disconnect', _data => {
        this.emit('disconnect')
      }),

      provider.addListener('networkChange', _data => {
        const chainId = mapXverseNameToCaipNetwork(_data.stacks.name as BitcoinNetworkType)
        this.emit('chainChanged', chainId)
      })
    )
  }

  private unbindEvents() {
    this.walletUnsubscribes.forEach(unsubscribe => unsubscribe())
    this.walletUnsubscribes = []
  }
}

export namespace SatsConnectConnector {
  export type ConstructorParams = {
    provider: SatsConnectProvider
    requestedChains: CaipNetwork[]
    getActiveNetwork: () => CaipNetwork | undefined
  }

  export type GetWalletsParams = {
    requestedChains: CaipNetwork[]
    getActiveNetwork: ConstructorParams['getActiveNetwork']
  }
}
