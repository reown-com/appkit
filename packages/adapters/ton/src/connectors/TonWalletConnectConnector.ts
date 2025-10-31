import type { CaipNetwork } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil, ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  type RequestArguments,
  WalletConnectConnector,
  WcHelpersUtil
} from '@reown/appkit-controllers'
import type { TonConnector } from '@reown/appkit-utils/ton'

import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'

export type WalletConnectProviderConfig = {
  provider: WalletConnectConnector['provider']
  chains: CaipNetwork[]
}

export class TonWalletConnectConnector
  extends WalletConnectConnector<'ton'>
  implements TonConnector
{
  public override readonly chain = CommonConstantsUtil.CHAIN.TON

  private eventEmitter = new ProviderEventEmitter()
  public readonly emit = this.eventEmitter.emit.bind(this.eventEmitter)
  public readonly on = this.eventEmitter.on.bind(this.eventEmitter)
  public readonly removeListener = this.eventEmitter.removeListener.bind(this.eventEmitter)

  constructor({ provider, chains }: WalletConnectProviderConfig) {
    super({ provider, caipNetworks: chains, namespace: ConstantsUtil.CHAIN.TON })
  }

  get imageUrl(): string | undefined {
    return undefined
  }

  get info() {
    return undefined
  }

  get chainsList() {
    return this.chains
  }

  public override get chains() {
    return this.sessionChains
      .map(chainId => this.caipNetworks.find(chain => chain.caipNetworkId === chainId))
      .filter(Boolean) as CaipNetwork[]
  }

  public async connect() {
    return Promise.reject(
      new Error('Connection of WalletConnectProvider should be done via UniversalAdapter')
    )
  }

  public async signData(params: TonConnector.SignDataParams): Promise<string> {
    const chain = ChainController.getCaipNetworkByNamespace(ConstantsUtil.CHAIN.TON)

    if (!chain) {
      throw new Error('Chain not found')
    }

    const request = {
      method: 'ton_signData',
      params: [params]
    }
    const result: { signature?: string; result?: { signature?: string } } | undefined =
      await this.provider.request(request, chain.caipNetworkId)

    return result?.signature || result?.result?.signature || ''
  }

  public async sendMessage(params: TonConnector.SendMessageParams): Promise<string> {
    const chain = ChainController.getCaipNetworkByNamespace(ConstantsUtil.CHAIN.TON)

    if (!chain) {
      throw new Error('Chain not found')
    }

    const request = {
      method: 'ton_sendMessage',
      params: [params]
    }
    const result: { boc?: string; result?: string } | undefined = await this.provider.request(
      request,
      chain.caipNetworkId
    )

    return result?.boc || result?.result || ''
  }

  async switchNetwork(): Promise<void> {
    return Promise.resolve()
  }

  public request<T>(args: RequestArguments) {
    // @ts-expect-error - args type should match internalRequest arguments but it's not correctly typed in Provider
    return this.internalRequest(args) as T
  }

  public setDefaultChain(chainId: string) {
    this.provider.setDefaultChain(chainId)
  }

  // -- Internals ----------------------------------------------------- //
  private get sessionChains() {
    return WcHelpersUtil.getChainsFromNamespaces(this.provider.session?.namespaces)
  }
}
