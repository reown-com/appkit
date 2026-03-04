import {
  Adapter,
  type AdapterName,
  AdapterState,
  WalletReadyState
} from '@tronweb3/tronwallet-abstract-adapter'

import { CoreHelperUtil } from '@reown/appkit-controllers'

interface ReownTronProvider {
  isReownWallet?: boolean
  isTronLink?: boolean
  ready?: boolean
  address?: string | null
  tronWeb?: unknown
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
  request?: (args: { method: string; params?: unknown }) => Promise<unknown>
}

/**
 * Adapter for Reown browser extension TRON provider.
 * **FOR TESTING ONLY** - Not included in published package exports.
 */
export class ReownTronAdapter extends Adapter {
  name = 'Reown' as AdapterName<'Reown'>
  url = 'https://reown.com'
  icon =
    'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/0618544b-b33c-4fbf-5c0c-1a5f7b3cd600/112x112'

  private provider: ReownTronProvider | null = null
  private _readyState: WalletReadyState = WalletReadyState.Loading
  private _state: AdapterState = AdapterState.Loading
  private _connecting = false
  private _address: string | null = null

  constructor() {
    super()
    if (CoreHelperUtil.isClient()) {
      this.checkWallet()
    }
  }

  get state(): AdapterState {
    return this._state
  }

  get readyState(): WalletReadyState {
    return this._readyState
  }

  get connecting(): boolean {
    return this._connecting
  }

  get address(): string | null {
    return this._address
  }

  private checkWallet(): void {
    const w = CoreHelperUtil.getWindow() as unknown as {
      reownTron?: ReownTronProvider
    }

    // Check for Reown provider in its unique namespace
    const reownProvider = w.reownTron?.isReownWallet ? w.reownTron : null

    if (reownProvider) {
      this.provider = reownProvider
      this._readyState = WalletReadyState.Found
      this._state = AdapterState.Disconnect
      this.emit('readyStateChanged', WalletReadyState.Found)
    } else {
      // Stay in Loading state - TronConnectUtil will watch for changes
      this._readyState = WalletReadyState.Loading
      this._state = AdapterState.Loading

      // Set a timeout to mark as NotFound if not detected within 3 seconds
      setTimeout(() => {
        if (this._readyState === WalletReadyState.Loading) {
          this._readyState = WalletReadyState.NotFound
          this._state = AdapterState.NotFound
          this.emit('readyStateChanged', WalletReadyState.NotFound)
        }
      }, 3000)
    }
  }

  override async connect(): Promise<void> {
    if (!this.provider) {
      throw new Error('Reown extension not found')
    }

    if (this._connecting) {
      return
    }

    try {
      this._connecting = true
      this._state = AdapterState.Loading

      const accounts = (await this.provider.request?.({
        method: 'eth_requestAccounts'
      })) as string[] | undefined

      const address = accounts?.[0] || this.provider.address || ''

      if (address) {
        this._address = address
        this._state = AdapterState.Connected
        this.emit('connect', address)
      } else {
        throw new Error('No address returned')
      }
    } catch (error) {
      this._state = AdapterState.Disconnect
      throw error
    } finally {
      this._connecting = false
    }
  }

  override disconnect(): Promise<void> {
    if (this.provider) {
      this._address = null
      this._state = AdapterState.Disconnect
      this.emit('disconnect')
    }

    return Promise.resolve()
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider?.tronWeb) {
      throw new Error('Reown extension not connected')
    }

    const tronWeb = this.provider.tronWeb as {
      trx?: { signMessageV2?: (msg: string) => Promise<string> }
    }

    if (!tronWeb.trx?.signMessageV2) {
      throw new Error('signMessageV2 not supported')
    }

    return tronWeb.trx.signMessageV2(message)
  }

  async signTransaction(transaction: unknown): Promise<unknown> {
    if (!this.provider?.tronWeb) {
      throw new Error('Reown extension not connected')
    }

    const tronWeb = this.provider.tronWeb as {
      trx?: { sign?: (tx: unknown) => Promise<unknown> }
    }

    if (!tronWeb.trx?.sign) {
      throw new Error('sign not supported')
    }

    return tronWeb.trx.sign(transaction)
  }
}
