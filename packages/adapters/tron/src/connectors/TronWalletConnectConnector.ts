import type { CaipNetwork } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil, ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  type RequestArguments,
  WalletConnectConnector,
  WcHelpersUtil
} from '@reown/appkit-controllers'
import type { TronConnector } from '@reown/appkit-utils/tron'

import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'

export type WalletConnectProviderConfig = {
  provider: WalletConnectConnector['provider']
  chains: CaipNetwork[]
}

export class TronWalletConnectConnector
  extends WalletConnectConnector<'tron'>
  implements TronConnector
{
  public override readonly chain = CommonConstantsUtil.CHAIN.TRON

  private eventEmitter = new ProviderEventEmitter()
  public readonly emit = this.eventEmitter.emit.bind(this.eventEmitter)
  public readonly on = this.eventEmitter.on.bind(this.eventEmitter)
  public readonly removeListener = this.eventEmitter.removeListener.bind(this.eventEmitter)

  constructor({ provider, chains }: WalletConnectProviderConfig) {
    super({ provider, caipNetworks: chains, namespace: ConstantsUtil.CHAIN.TRON })
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

  public async signMessage(params: TronConnector.SignMessageParams): Promise<string> {
    const chain = ChainController.getCaipNetworkByNamespace(ConstantsUtil.CHAIN.TRON)

    if (!chain) {
      throw new Error('Chain not found')
    }

    const request = {
      method: 'tron_signMessage',
      params: {
        address: params.from,
        message: params.message
      }
    }

    const result: { signature?: string } | string | undefined = await this.provider.request(
      request,
      chain.caipNetworkId
    )

    if (typeof result === 'string') {
      return result
    }

    return result?.signature || ''
  }

  public async sendTransaction(params: TronConnector.SendTransactionParams): Promise<string> {
    const chain = ChainController.getCaipNetworkByNamespace(ConstantsUtil.CHAIN.TRON)

    if (!chain) {
      throw new Error('Chain not found')
    }

    const request = {
      method: 'tron_signTransaction',
      params: {
        address: params.from,
        transaction: {
          to: params.to,
          from: params.from,
          value: params.value,
          data: params.data
        }
      }
    }
    const result: { txID?: string; signature?: string[] } | undefined = await this.provider.request(
      request,
      chain.caipNetworkId
    )

    return result?.txID || ''
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
