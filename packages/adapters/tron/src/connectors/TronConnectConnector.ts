import type { Adapter } from '@tronweb3/tronwallet-abstract-adapter'
import type { RequestArguments } from '@walletconnect/universal-provider'

import type { CaipNetwork } from '@reown/appkit-common'
import type { TronConnector } from '@reown/appkit-utils/tron'

import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'

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
    const method = args.method

    if (method === 'tron_requestAccounts') {
      return this.connect().then(addr => [addr] as unknown as T)
    }

    if (method === 'tron_signMessageV2') {
      const params = args.params as { message: string }

      return this.adapter.signMessage(params.message) as Promise<T>
    }

    if (method === 'tron_sendTransaction') {
      const params = args.params as { transaction: Record<string, unknown> }

      return this.adapter.signTransaction(params.transaction) as Promise<T>
    }

    throw new Error(`Unsupported method: ${method}`)
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
    const transaction = {
      to: params.to,
      from: params.from,
      value: params.value,
      data: params.data
    }

    const result = (await this.adapter.signTransaction(transaction)) as
      | { txid?: string; result?: boolean }
      | string

    if (typeof result === 'string') {
      return result
    }

    if (result?.txid) {
      return result.txid
    }

    throw new Error('No transaction hash returned')
  }

  async switchNetwork(): Promise<void> {
    return Promise.resolve()
  }

  // -- Private ------------------------------------------------------ //
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
