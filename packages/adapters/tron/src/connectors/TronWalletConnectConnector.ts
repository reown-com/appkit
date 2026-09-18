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
import { TronFullnodeUtil } from '../utils/TronFullnodeUtil.js'

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
    const chain = this.getActiveChain()

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

  /**
   * Signs a TronWeb transaction JSON as-is (no build, no broadcast). Wallets opt into
   * the simplified (v1) payload shape by advertising `tron_method_version: "v1"` in
   * sessionProperties during the handshake; otherwise the spec mandates the legacy
   * nested `transaction.transaction` shape. `address` defaults to the session's
   * first Tron account.
   * See https://docs.reown.com/advanced/multichain/rpc-reference/tron-rpc
   */
  public async signTransaction<T extends TronWalletConnectConnector.Transaction>(
    transaction: T,
    address: string | undefined = this.getActiveAddress()
  ): Promise<T & TronWalletConnectConnector.SignedTransaction> {
    const chain = this.getActiveChain()
    const isV1Format = this.provider.session?.sessionProperties?.['tron_method_version'] === 'v1'
    const signedTx: (T & TronWalletConnectConnector.SignedTransaction) | undefined =
      await this.provider.request(
        {
          method: 'tron_signTransaction',
          params: {
            address,
            transaction: isV1Format ? transaction : { transaction }
          }
        },
        chain.caipNetworkId
      )

    if (!signedTx?.signature?.length) {
      throw new Error('Transaction signing failed')
    }

    return signedTx
  }

  public async sendTransaction(params: TronConnector.SendTransactionParams): Promise<string> {
    const chain = this.getActiveChain()
    const isBlockchainApiSupported = CaipNetworksUtil.isWcHttpRpcSupported(chain.caipNetworkId)

    /*
     * Step 1: Build unsigned transaction, via the Blockchain API where it's supported,
     * otherwise directly against the chain's own fullnode.
     */
    const unsignedTx = isBlockchainApiSupported
      ? await this.createTransactionViaBlockchainApi(chain, params)
      : await TronFullnodeUtil.createTransaction(this.requireFullNodeUrl(chain), params)

    // Step 2: Send full transaction to wallet for signing via WalletConnect
    const signedTx = await this.signTransaction(unsignedTx, params.from)

    // Step 3: Broadcast the signed transaction, via the same path used to build it.
    if (isBlockchainApiSupported) {
      await this.broadcastViaBlockchainApi(chain, signedTx, unsignedTx)
    } else {
      await TronFullnodeUtil.broadcastTransaction(this.requireFullNodeUrl(chain), signedTx)
    }

    return signedTx.txID || unsignedTx.txID
  }

  async switchNetwork(): Promise<void> {
    return Promise.resolve()
  }

  public async request<T>(args: RequestArguments): Promise<T> {
    return this.provider.request<T>(args, this.getActiveChain().caipNetworkId)
  }

  public setDefaultChain(chainId: string) {
    this.provider?.setDefaultChain(chainId)
  }

  // -- Internals ----------------------------------------------------- //
  private getActiveChain(): CaipNetwork {
    const chain = ChainController.getCaipNetworkByNamespace(ConstantsUtil.CHAIN.TRON)

    if (!chain) {
      throw new Error('Chain not found')
    }

    return chain
  }

  private getActiveAddress(): string | undefined {
    const account = this.provider.session?.namespaces?.[ConstantsUtil.CHAIN.TRON]?.accounts?.[0]

    return account?.split(':')[2]
  }

  private getRpcUrl(chain: CaipNetwork): string {
    const projectId = OptionsController.state.projectId

    return CaipNetworksUtil.getDefaultRpcUrl(chain, chain.caipNetworkId, projectId)
  }

  private requireFullNodeUrl(chain: CaipNetwork): string {
    const fullNodeUrl = chain.rpcUrls?.['chainDefault']?.http?.[0]

    if (!fullNodeUrl) {
      throw new Error('No RPC URL available for this chain')
    }

    return fullNodeUrl
  }

  private async createTransactionViaBlockchainApi(
    chain: CaipNetwork,
    params: TronConnector.SendTransactionParams
  ): Promise<Record<string, unknown> & { txID: string }> {
    const rpcUrl = this.getRpcUrl(chain)

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

    return unsignedTx
  }

  private async broadcastViaBlockchainApi(
    chain: CaipNetwork,
    signedTx: {
      txID?: string
      signature?: string[]
      raw_data?: Record<string, unknown>
      raw_data_hex?: string
      visible?: boolean
    },
    unsignedTx: Record<string, unknown> & { txID: string }
  ): Promise<void> {
    const rpcUrl = this.getRpcUrl(chain)

    const broadcastResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tron_broadcastTransaction',
        params: [
          signedTx.txID || unsignedTx.txID,
          signedTx.visible ?? unsignedTx['visible'] ?? true,
          signedTx.raw_data || unsignedTx['raw_data'],
          signedTx.raw_data_hex || unsignedTx['raw_data_hex'],
          signedTx.signature
        ]
      })
    })
    const broadcastResult = await broadcastResponse.json()

    if (!broadcastResult?.result?.result) {
      throw new Error(broadcastResult?.result?.message || 'Failed to broadcast transaction')
    }
  }

  private get sessionChains() {
    return WcHelpersUtil.getChainsFromNamespaces(this.provider.session?.namespaces)
  }
}

export declare namespace TronWalletConnectConnector {
  /** Raw TronWeb transaction JSON (as returned by `tron_createTransaction`). */
  type Transaction = {
    txID?: string
    raw_data?: Record<string, unknown>
    raw_data_hex?: string
    visible?: boolean
  }
  type SignedTransaction = Transaction & { signature?: string[] }
}
