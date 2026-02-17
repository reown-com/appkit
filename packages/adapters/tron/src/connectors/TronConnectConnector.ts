import type { Adapter } from '@tronweb3/tronwallet-abstract-adapter'
import type { RequestArguments } from '@walletconnect/universal-provider'

import type { CaipNetwork } from '@reown/appkit-common'
import type { TronConnector } from '@reown/appkit-utils/tron'

import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'

/**
 * Maps TRON chain IDs to fullnode API URLs for building transactions.
 */
const TRON_FULLNODE_URLS: Record<string, string> = {
  '0x2b6653dc': 'https://api.trongrid.io',
  '0x94a9059e': 'https://api.shasta.trongrid.io',
  '0xcd8690dc': 'https://nile.trongrid.io'
}

const DEFAULT_TRON_FULLNODE_URL = 'https://api.trongrid.io'

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
    const fullNodeUrl = await this.getFullNodeUrl()

    // Build a proper unsigned transaction via the TRON fullnode API
    const createResponse = await fetch(`${fullNodeUrl}/wallet/createtransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: params.from,
        to_address: params.to,
        amount: parseInt(params.value, 10),
        visible: true
      })
    })

    const unsignedTx = await createResponse.json()

    if (!unsignedTx.txID) {
      throw new Error(unsignedTx.Error || 'Failed to create transaction')
    }

    // Sign the transaction with the wallet adapter
    const signedTx = await this.adapter.signTransaction(unsignedTx)

    // Broadcast the signed transaction
    const broadcastResponse = await fetch(`${fullNodeUrl}/wallet/broadcasttransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signedTx)
    })

    const broadcastResult = await broadcastResponse.json()

    if (!broadcastResult.result) {
      throw new Error(broadcastResult.message || 'Failed to broadcast transaction')
    }

    return unsignedTx.txID
  }

  async switchNetwork(): Promise<void> {
    /*
     * Network switching is handled entirely by the adapter.
     * The adapter manually updates the connection and emits the switchNetwork event.
     */
    return Promise.resolve()
  }

  // -- Private ------------------------------------------------------ //

  /**
   * Resolves the TRON fullnode API URL for building and broadcasting transactions.
   * Uses the adapter's chainId to pick the correct network, but always maps to our
   * own controlled URLs (not the adapter's fullNode) to avoid third-party CSP issues.
   * TODO: Route through rpc.walletconnect.org once the RPC proxy supports TRON.
   */
  private async getFullNodeUrl(): Promise<string> {
    const adapterWithNetwork = this.adapter as Adapter & {
      network?: () => Promise<{ chainId?: string }>
    }

    if (typeof adapterWithNetwork.network === 'function') {
      try {
        const network = await adapterWithNetwork.network()

        if (network.chainId) {
          return TRON_FULLNODE_URLS[network.chainId] || DEFAULT_TRON_FULLNODE_URL
        }
      } catch {
        // Adapter may not support network() — fall through to chain mapping
      }
    }

    const chain = this.requestedChains[0]

    if (chain) {
      return TRON_FULLNODE_URLS[chain.id] || DEFAULT_TRON_FULLNODE_URL
    }

    return DEFAULT_TRON_FULLNODE_URL
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
