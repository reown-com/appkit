'use client'

import type { CaipNetwork } from '@reown/appkit-common'

import type {
  PolkadotAccount,
  PolkadotExtension,
  PolkadotProvider,
  PolkadotWalletSource
} from '../providers/PolkadotProvider.js'

/** Events this connector emits (aligns with AppKit expectations) */
type PolkadotConnectorEvents = {
  connect: [address: string]
  accountsChanged: [accounts: Array<{ namespace: string; address: string; type: 'eoa' }>]
  chainChanged: [chainId: string] // CAIP-2 (e.g. 'polkadot:...') or your string id
  disconnect: []
  error: [error: unknown]
}

/** Strongly typed event emitter */
class PolkadotEventEmitter<EvtMap extends Record<string, unknown[]>> {
  private listeners = new Map<keyof EvtMap, Set<(...args: any[]) => void>>()

  emit<K extends keyof EvtMap>(event: K, ...args: EvtMap[K]) {
    const set = this.listeners.get(event)
    if (!set) return
    for (const fn of set) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        fn(...(args as any[]))
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[PolkadotEventEmitter] Error in "${String(event)}" listener:`, err)
      }
    }
  }

  on<K extends keyof EvtMap>(event: K, listener: (...args: EvtMap[K]) => void) {
    const set = this.listeners.get(event) ?? new Set()
    set.add(listener as any)
    this.listeners.set(event, set)
  }

  off<K extends keyof EvtMap>(event: K, listener: (...args: EvtMap[K]) => void) {
    const set = this.listeners.get(event)
    set?.delete(listener as any)
  }

  removeAllListeners(event?: keyof EvtMap) {
    if (event) this.listeners.delete(event)
    else this.listeners.clear()
  }
}

/** Result your connectHandler should return */
type ConnectResult = {
  /** Primary address to announce via `connect` event */
  address: string
  /** Accounts to seed this connector with */
  accounts?: PolkadotAccount[]
  /** Optional canonical CAIP-2 chain id (e.g., 'polkadot:91b171...') */
  chainId?: string | number // Allow number for AdapterBlueprint compatibility
  /**
   * Optional unsubscribe function if you subscribe to extension account changes.
   * If provided, `disconnect()` will call it.
   */
  unsubscribe?: () => void
}

declare global {
  interface Window {
    injectedWeb3?: Record<string, PolkadotExtension>
  }
}

/** Normalize known extension ids so `isInstalled()` is robust */
function normalizeSource(source: PolkadotWalletSource): string {
  // Common aliases used by extensions
  switch (source) {
    case 'talisman':
    case 'talisman-extension':
      return 'talisman'
    case 'subwallet-js':
    case 'subwallet':
      return 'subwallet-js'
    case 'polkadot-js':
    case 'polkadotjs':
      return 'polkadot-js'
    default:
      return String(source)
  }
}

/**
 * Polkadot connector provider that matches AppKit’s expected interface.
 * Extends a typed event emitter and exposes WalletStandard-like surface.
 */
export class PolkadotConnectorProvider extends PolkadotEventEmitter<PolkadotConnectorEvents> {
  public readonly id: string
  public readonly type: 'INJECTED' | 'ANNOUNCED' | 'EXTERNAL' = 'INJECTED'
  public readonly name: string
  public readonly imageUrl?: string
  public readonly imageId?: string
  public readonly explorerId?: string
  /** Important: AppKit expects `provider` to point to the instance */
  public provider: PolkadotProvider | null
  public readonly chains: CaipNetwork[]
  /** Current chain identifier you use internally (often CAIP-2 string) */
  public chain: string
  public readonly namespace: string = 'polkadot'
  public accounts: PolkadotAccount[] = []

  private readonly source: PolkadotWalletSource
  private readonly connectHandler: (source: PolkadotWalletSource) => Promise<ConnectResult>
  private unbindExternal?: () => void

  constructor(config: {
    id: string
    source: PolkadotWalletSource
    name: string
    imageUrl?: string
    imageId?: string
    explorerId?: string
    chains: CaipNetwork[]
    chain: string
    connectHandler: (source: PolkadotWalletSource) => Promise<ConnectResult>
  }) {
    super()
    this.id = config.id
    this.source = config.source
    this.name = config.name
    this.imageUrl = config.imageUrl
    this.imageId = config.imageId
    this.explorerId = config.explorerId
    this.chains = config.chains
    this.chain = config.chain
    this.connectHandler = config.connectHandler

    // Mark as ready (WalletStandard pattern)
    this.provider = this as unknown as PolkadotProvider

    // eslint-disable-next-line no-console
    console.log('[PolkadotConnectorProvider] Created', {
      id: this.id,
      name: this.name,
      type: this.type,
      source: this.source,
      chains: this.chains.map(c => c.caipNetworkId ?? c.id)
    })

    this.bindEvents()
  }

  /** Placeholder—most Polkadot extensions use subscribe APIs post-connect */
  private bindEvents(): void {
    // Keep for parity / future enhancements
    // eslint-disable-next-line no-console
    console.log(`[PolkadotConnectorProvider] Event bindings ready for ${this.name}`)
  }

  /**
   * Called by AppKit when the user picks this connector.
   * Must emit `connect` and seed `accounts`.
   */
  async connect(params?: { chainId?: string; socialUri?: string }): Promise<string> {
    // eslint-disable-next-line no-console
    console.log('[PolkadotConnectorProvider] CONNECT', {
      name: this.name,
      source: this.source,
      params
    })

    try {
      const res = await this.connectHandler(this.source)

      // Seed internal state
      if (res.accounts?.length) {
        this.setAccounts(res.accounts)
      }

      if (res.chainId) {
        this.chain = String(res.chainId) // Convert to string for compatibility
        this.emit('chainChanged', String(res.chainId))
      }

      if (res.unsubscribe) this.unbindExternal = res.unsubscribe

      // Announce connection
      this.emit('connect', res.address)
      return res.address
    } catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  /**
   * AppKit calls this to fetch normalized accounts.
   * We map to { namespace, address, type } tuples.
   */
  async getAccounts(): Promise<Array<{ namespace: string; address: string; type: 'eoa' }>> {
    return this.accounts.map(a => ({
      namespace: this.namespace,
      address: a.address,
      type: 'eoa'
    }))
  }

  /**
   * Disconnect and clear state. If you subscribed to extension events,
   * provide an `unsubscribe` in your connectHandler—this will call it.
   */
  async disconnect(): Promise<void> {
    try {
      this.unbindExternal?.()
    } catch {
      /* noop */
    } finally {
      this.unbindExternal = undefined
    }

    this.provider = null
    this.accounts = []
    this.emit('disconnect')
  }

  /**
   * Lightweight install check based on injectedWeb3.
   * Make sure `source` matches the injected key (normalized).
   */
  isInstalled(): boolean {
    if (typeof window === 'undefined') return false
    const key = normalizeSource(this.source)
    return Boolean(window.injectedWeb3?.[key])
  }

  /** Update internal accounts and emit `accountsChanged` in AppKit shape */
  private setAccounts(accounts: PolkadotAccount[]) {
    this.accounts = accounts
    this.emit(
      'accountsChanged',
      accounts.map(a => ({ namespace: this.namespace, address: a.address, type: 'eoa' as const }))
    )
  }
}
