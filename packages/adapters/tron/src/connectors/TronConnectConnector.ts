import type { Adapter } from '@tronweb3/tronwallet-abstract-adapter'
import type { RequestArguments } from '@walletconnect/universal-provider'

import type { CaipNetwork } from '@reown/appkit-common'
import { ChainController, OptionsController } from '@reown/appkit-controllers'
import { CaipNetworksUtil } from '@reown/appkit-utils'
import type { TronConnector } from '@reown/appkit-utils/tron'

import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'
import { TronFullnodeUtil } from '../utils/TronFullnodeUtil.js'

export class TronConnectConnector implements TronConnector {
  public readonly chain = 'tron'
  public readonly type = 'INJECTED'

  private readonly requestedChains: CaipNetwork[]
  private readonly adapter: Adapter

  private eventEmitter = new ProviderEventEmitter()
  public readonly emit = this.eventEmitter.emit.bind(this.eventEmitter)
  public readonly on = this.eventEmitter.on.bind(this.eventEmitter)
  public readonly removeListener = this.eventEmitter.removeListener.bind(this.eventEmitter)

  constructor({ adapter, chains }: { adapter: Adapter; chains: CaipNetwork[] }) {
    this.adapter = adapter
    this.requestedChains = chains
    this.setupAdapterListeners()
  }

  public get id(): string {
    return this.adapter.name
  }

  public get name(): string {
    return this.adapter.name
  }

  public get imageUrl(): string | undefined {
    return this.adapter.icon
  }

  public get chains(): CaipNetwork[] {
    return this.requestedChains
  }

  public get provider(): TronConnector {
    return this
  }

  public request<T>(args: RequestArguments): Promise<T> {
    const { method, params } = args

    switch (method) {
      case 'tron_requestAccounts':
        return this.connect().then(addr => [addr] as unknown as T)

      case 'tron_signMessageV2': {
        const { message } = params as { message: string }

        return this.adapter.signMessage(message) as Promise<T>
      }

      case 'tron_sendTransaction': {
        const { transaction } = params as { transaction: Record<string, unknown> }

        return this.adapter.signTransaction(transaction) as Promise<T>
      }

      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  }

  async connect(): Promise<string> {
    await this.adapter.connect()

    const address = this.adapter.address

    if (!address) {
      throw new Error('No address available after connect')
    }

    this.emit('accountsChanged', [address])

    return address
  }

  async disconnect(): Promise<void> {
    try {
      await this.adapter.disconnect()
    } catch {
      // Silently fail — some wallets don't support programmatic disconnect
    }
  }

  async signMessage(params: TronConnector.SignMessageParams): Promise<string> {
    const result = await this.adapter.signMessage(params.message)

    return result || ''
  }

  async sendTransaction(params: TronConnector.SendTransactionParams): Promise<string> {
    const chain = ChainController.getCaipNetworkByNamespace('tron') ?? this.requestedChains[0]

    if (chain && !CaipNetworksUtil.isWcHttpRpcSupported(chain.caipNetworkId)) {
      return this.sendTransactionViaFullnode(chain, params)
    }

    const rpcUrl = this.getRpcUrl()

    // Step 1: Build unsigned transaction via Blockchain API
    const createResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tron_createTransaction',
        params: [params.from, params.to, parseInt(params.value, 10), true]
      })
    })

    const createResult = await createResponse.json()
    const unsignedTx = createResult?.result

    if (!unsignedTx?.txID) {
      throw new Error(unsignedTx?.Error || 'Failed to create transaction')
    }

    // Step 2: Sign the transaction with the wallet adapter
    const signedTx = await this.adapter.signTransaction(unsignedTx)

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

    return unsignedTx.txID
  }

  async switchNetwork(chainId: string): Promise<void> {
    /*
     * The underlying tronweb3 adapter (e.g. TronLink, MetaMask) keeps its own network/session
     * state and needs to be told explicitly to switch, via its bare (non-CAIP) chain id - e.g.
     * '0x94a9059e', not 'tron:0x94a9059e'. Without this, wallets that default to a fixed
     * network on connect (MetaMask always starts on Mainnet) never actually switch, even
     * though our own app state has moved to a different chain.
     *
     * Not every wallet adapter supports this (the base Adapter class's default implementation
     * rejects), so failures are swallowed the same way disconnect() above does, instead of
     * blocking the app's own network switch for wallets that can't act on it.
     */
    try {
      await this.adapter.switchChain(chainId.split(':').pop() ?? chainId)
    } catch {
      // Silently fail — some wallets don't support programmatic chain switching
    }
  }

  // -- Private ------------------------------------------------------ //

  private async sendTransactionViaFullnode(
    chain: CaipNetwork,
    params: TronConnector.SendTransactionParams
  ): Promise<string> {
    const fullNodeUrl = chain.rpcUrls?.['chainDefault']?.http?.[0]

    if (!fullNodeUrl) {
      throw new Error('No RPC URL available for this chain')
    }

    const unsignedTx = await TronFullnodeUtil.createTransaction(fullNodeUrl, params)
    const signedTx = await this.adapter.signTransaction(unsignedTx)

    await TronFullnodeUtil.broadcastTransaction(fullNodeUrl, signedTx)

    return (signedTx as { txID?: string }).txID || unsignedTx.txID
  }

  private getRpcUrl(): string {
    const chain = ChainController.getCaipNetworkByNamespace('tron')
    const projectId = OptionsController.state.projectId

    if (chain) {
      return CaipNetworksUtil.getDefaultRpcUrl(chain, chain.caipNetworkId, projectId)
    }

    const fallbackChain = this.requestedChains[0]

    if (fallbackChain) {
      return CaipNetworksUtil.getDefaultRpcUrl(
        fallbackChain,
        fallbackChain.caipNetworkId,
        projectId
      )
    }

    return ''
  }

  private setupAdapterListeners() {
    this.adapter.on('connect', (address: unknown) => {
      if (typeof address === 'string' && address) {
        this.emit('accountsChanged', [address])
      }
    })

    this.adapter.on('disconnect', () => {
      this.emit('disconnect', undefined)
    })

    this.adapter.on('accountsChanged', (newAddress: unknown) => {
      if (typeof newAddress === 'string' && newAddress) {
        this.emit('accountsChanged', [newAddress])
      }
    })

    this.adapter.on('chainChanged', (data: unknown) => {
      if (typeof data === 'object' && data !== null && 'chainId' in data) {
        this.emit('chainChanged', (data as { chainId: string }).chainId)
      } else if (typeof data === 'string') {
        this.emit('chainChanged', data)
      }
    })
  }
}
