import type { CaipNetwork } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil, ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  OptionsController,
  type RequestArguments,
  WalletConnectConnector,
  WcHelpersUtil
} from '@reown/appkit-controllers'
import { CaipNetworksUtil } from '@reown/appkit-utils'
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

    const rpcUrl = this.getRpcUrl(chain)

    // Step 1: Build unsigned transaction via Blockchain API
    const createTxResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tron_createTransaction',
        params: [params.from, params.to, parseInt(params.value, 10), true]
      })
    })
    const createTxResult = await createTxResponse.json()
    const unsignedTx = createTxResult?.result

    if (!unsignedTx?.txID) {
      throw new Error(unsignedTx?.Error || 'Failed to create transaction')
    }

    /*
     * Step 2: Send full transaction to wallet for signing via WalletConnect.
     * Wallets opt into the simplified (v1) payload shape by advertising
     * `tron_method_version: "v1"` in sessionProperties during the handshake.
     * Otherwise the spec mandates the legacy nested `transaction.transaction` shape.
     */
    // See https://docs.reown.com/advanced/multichain/rpc-reference/tron-rpc
    const usesV1Format = this.provider.session?.sessionProperties?.['tron_method_version'] === 'v1'
    const signRequest = {
      method: 'tron_signTransaction',
      params: {
        address: params.from,
        transaction: usesV1Format ? unsignedTx : { transaction: unsignedTx }
      }
    }
    const signedTx:
      | {
          txID?: string
          signature?: string[]
          raw_data?: Record<string, unknown>
          raw_data_hex?: string
          visible?: boolean
        }
      | undefined = await this.provider.request(signRequest, chain.caipNetworkId)

    if (!signedTx?.signature?.length) {
      throw new Error('Transaction signing failed')
    }

    // Step 3: Broadcast the signed transaction via Blockchain API
    const broadcastResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tron_broadcastTransaction',
        params: [
          signedTx.txID || unsignedTx.txID,
          signedTx.visible ?? unsignedTx.visible ?? true,
          signedTx.raw_data || unsignedTx.raw_data,
          signedTx.raw_data_hex || unsignedTx.raw_data_hex,
          signedTx.signature
        ]
      })
    })
    const broadcastResult = await broadcastResponse.json()

    if (!broadcastResult?.result?.result) {
      throw new Error(broadcastResult?.result?.message || 'Failed to broadcast transaction')
    }

    return signedTx.txID || unsignedTx.txID
  }

  async switchNetwork(): Promise<void> {
    return Promise.resolve()
  }

  public request<T>(args: RequestArguments) {
    // @ts-expect-error - args type should match internalRequest arguments but it's not correctly typed in Provider
    return this.internalRequest(args) as T
  }

  public setDefaultChain(chainId: string) {
    this.provider?.setDefaultChain(chainId)
  }

  // -- Internals ----------------------------------------------------- //
  private getRpcUrl(chain: CaipNetwork): string {
    const projectId = OptionsController.state.projectId

    return CaipNetworksUtil.getDefaultRpcUrl(chain, chain.caipNetworkId, projectId)
  }

  private get sessionChains() {
    return WcHelpersUtil.getChainsFromNamespaces(this.provider.session?.namespaces)
  }
}
