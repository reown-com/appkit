import * as TrezorConnectWeb from '@trezor/connect-web'
import { utils } from 'ethers'

import type { CaipNetwork, CaipNetworkId } from '@reown/appkit-common'
import { CoreHelperUtil, type Provider, type RequestArguments } from '@reown/appkit-controllers'

/**
 * Standard Ethereum derivation path, first account. Matches the address
 * MetaMask and Ledger Live derive for the same seed, so funds appear where
 * users expect them.
 *
 * Trezor firmware may reject signing for chains with their own registered
 * SLIP-44 coin type (e.g. Rootstock: 137 mainnet / 37310 testnet) from this
 * path with "Forbidden key path" unless the device's Safety Checks setting
 * is set to "Prompt".
 */
const ETH_DERIVATION_PATH = "m/44'/60'/0'/0/0"

interface TrezorResponse<P> {
  success: boolean
  payload: P & { error?: string; code?: string }
}

interface TrezorConnectApi {
  init(settings: {
    manifest: { email: string; appUrl: string; appName?: string }
    lazyLoad?: boolean
    popup?: boolean
  }): Promise<void>
  ethereumGetAddress(params: {
    path: string
    showOnTrezor?: boolean
  }): Promise<TrezorResponse<{ address: string }>>
  ethereumSignTransaction(params: {
    path: string
    transaction: {
      to: string
      value: string
      gasPrice: string
      gasLimit: string
      nonce: string
      data: string
      chainId: number
    }
  }): Promise<TrezorResponse<{ v: string; r: string; s: string }>>
  ethereumSignMessage(params: {
    path: string
    message: string
    hex?: boolean
  }): Promise<TrezorResponse<{ signature: string }>>
  ethereumSignTypedData(params: {
    path: string
    data: Record<string, unknown>
    metamask_v4_compat: boolean
  }): Promise<TrezorResponse<{ signature: string }>>
}

let cachedTrezorConnect: TrezorConnectApi | undefined = undefined

/**
 * `@trezor/connect-web` is CommonJS and exposes its API as `exports.default`,
 * alongside `export *` named exports.
 *
 * Bundlers that honour the `__esModule` marker (webpack, Rollup, and Vite's
 * source transform) hand that object back as the default import. Node's ESM/CJS
 * interop does not: there, and under esbuild's node-mode interop — which Vite
 * uses when it prebundles this package as a dependency — the default import is
 * the whole `module.exports`, so the API sits one level deeper and
 * `TrezorConnect.init` is undefined.
 *
 * Probing for `init` covers every interop shape instead of assuming one. It is
 * deliberately lazy so that a bad resolution surfaces when the connector is
 * used rather than breaking the adapter's module import.
 */
function getTrezorConnect(): TrezorConnectApi {
  if (cachedTrezorConnect) {
    return cachedTrezorConnect
  }

  const namespace = TrezorConnectWeb as unknown as {
    default?: { default?: unknown } & Record<string, unknown>
  }

  const candidates = [namespace.default?.default, namespace.default, namespace]
  const resolved = candidates.find(
    candidate => typeof (candidate as TrezorConnectApi | undefined)?.init === 'function'
  )

  if (!resolved) {
    throw new Error(
      '@trezor/connect-web did not expose an init() method. This usually means the module was ' +
        'loaded through an interop path that hides its default export.'
    )
  }

  cachedTrezorConnect = resolved as TrezorConnectApi

  return cachedTrezorConnect
}

function rpcError(message: string, code: number): Error {
  return Object.assign(new Error(message), { code })
}

function isUserRejection(message: string): boolean {
  const lower = message.toLowerCase()

  return lower.includes('cancel') || lower.includes('closed') || lower.includes('denied')
}

interface EthTransaction {
  from?: string
  to?: string
  value?: string
  data?: string
  gas?: string
  gasLimit?: string
  gasPrice?: string
  nonce?: string
}

type Listener = (data: unknown) => void

export namespace TrezorConnectorTypes {
  export interface ConstructorParams {
    /** Networks the host app configured; only eip155 ones are used. */
    requestedChains: CaipNetwork[]
    /** The network to start on; falls back to the first requested chain. */
    requestedCaipNetworkId?: CaipNetworkId
  }

  export type GetWalletParams = ConstructorParams
}

/**
 * EIP-1193 provider backed by Trezor Connect, registered by the adapter like
 * an announced browser wallet. Read-only JSON-RPC calls are forwarded to the
 * active network's RPC endpoint; account and signing requests go to the
 * device. Transactions are signed on the device and broadcast through the
 * same RPC endpoint as legacy gas-price transactions, which every EVM chain
 * accepts — including those without EIP-1559 support, such as Rootstock.
 */
export class TrezorConnector implements Provider {
  public readonly id = 'trezor'
  public readonly name = 'Trezor'
  public readonly chain = 'eip155'
  public readonly type = 'ANNOUNCED'
  public readonly chains: CaipNetwork[] = []
  public readonly imageUrl =
    'https://pbs.twimg.com/profile_images/1876994745022529536/5FD_cxXO_400x400.jpg'

  public readonly provider = this

  private readonly listeners = new Map<string, Set<Listener>>()
  private readonly rpcUrls = new Map<string, string>()
  private accounts: string[] = []
  private initialized = false
  private chainIdHex = '0x1'

  constructor({ requestedChains, requestedCaipNetworkId }: TrezorConnectorTypes.ConstructorParams) {
    const evmChains = requestedChains.filter(chain => chain.chainNamespace === 'eip155')
    this.chains = evmChains

    for (const network of evmChains) {
      const id = Number(network.id)
      const rpcUrl = network.rpcUrls?.default?.http?.[0]
      if (Number.isFinite(id) && rpcUrl) {
        this.rpcUrls.set(`0x${id.toString(16)}`, rpcUrl)
      }
    }

    const requested = evmChains.find(chain => chain.caipNetworkId === requestedCaipNetworkId)
    const initialChain = requested ?? evmChains[0]
    if (initialChain) {
      this.chainIdHex = `0x${Number(initialChain.id).toString(16)}`
    }
  }

  public static getWallet(
    params: TrezorConnectorTypes.GetWalletParams
  ): TrezorConnector | undefined {
    if (!CoreHelperUtil.isClient()) {
      return undefined
    }

    // Trezor uses a popup flow, so it's always available in browser environments
    return new TrezorConnector(params)
  }

  // -- Provider event emitter --------------------------------- //

  public on(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(listener)
  }

  public removeListener<T>(event: string, listener: (data: T) => void): void {
    this.listeners.get(event)?.delete(listener as Listener)
  }

  public emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach(listener => listener(data))
  }

  // -- Provider interface ------------------------------------- //

  public async connect(): Promise<string> {
    const [address] = await this.connectAccounts()

    return address ?? ''
  }

  public async disconnect(): Promise<void> {
    this.accounts = []
    this.emit('accountsChanged', [])
    this.emit('disconnect')

    return Promise.resolve()
  }

  public async request<T>(args: RequestArguments): Promise<T> {
    const method = args.method
    const params = args.params as unknown[] | undefined

    switch (method) {
      case 'eth_requestAccounts':
        return (await this.connectAccounts()) as T
      case 'eth_accounts':
        return this.accounts as T
      case 'eth_chainId':
        return this.chainIdHex as T
      case 'net_version':
        return String(parseInt(this.chainIdHex, 16)) as T
      case 'wallet_switchEthereumChain':
        return this.switchChain(params) as T
      case 'wallet_addEthereumChain':
        return null as T
      case 'wallet_getPermissions':
      case 'wallet_requestPermissions':
        return [] as T
      case 'wallet_revokePermissions':
        this.accounts = []
        this.emit('accountsChanged', [])

        return null as T
      case 'eth_sendTransaction':
        return (await this.sendTransaction((params?.[0] ?? {}) as EthTransaction)) as T
      case 'personal_sign':
        return (await this.signMessage(String(params?.[0] ?? ''))) as T
      case 'eth_sign':
        return (await this.signMessage(String(params?.[1] ?? ''))) as T
      case 'eth_signTypedData_v4':
      case 'eth_signTypedData':
        return (await this.signTypedData(params?.[1])) as T
      default:
        return (await this.rpcRequest(method, params)) as T
    }
  }

  // -- Private methods ----------------------------------------- //

  private async initTrezor(): Promise<TrezorConnectApi> {
    const trezor = getTrezorConnect()

    if (this.initialized) {
      return trezor
    }

    try {
      await trezor.init({
        manifest: {
          email: 'support@reown.com',
          appUrl: typeof window === 'undefined' ? 'https://reown.com' : window.location.origin,
          appName: 'Reown AppKit'
        },
        lazyLoad: true,
        popup: true
      })
    } catch (error) {
      /*
       * Trezor Connect is a page-global singleton: the host app (or another
       * connector, e.g. the Bitcoin adapter's) may have initialized it first,
       * which init() reports as an error even though the instance is usable.
       */
      const message = error instanceof Error ? error.message : String(error)
      if (!message.toLowerCase().includes('already initialized')) {
        throw error
      }
    }

    this.initialized = true

    return trezor
  }

  private async connectAccounts(): Promise<string[]> {
    if (this.accounts.length > 0) {
      return this.accounts
    }

    const trezor = await this.initTrezor()
    const result = await trezor.ethereumGetAddress({
      path: ETH_DERIVATION_PATH,
      showOnTrezor: false
    })
    if (!result.success) {
      const message = result.payload.error ?? 'Trezor: ethereumGetAddress failed'
      throw rpcError(message, isUserRejection(message) ? 4001 : -32603)
    }

    this.accounts = [result.payload.address]
    this.emit('accountsChanged', this.accounts)

    return this.accounts
  }

  private switchChain(params?: unknown[]): null {
    const requested = (params?.[0] as { chainId?: string } | undefined)?.chainId?.toLowerCase()
    if (!requested || !this.rpcUrls.has(requested)) {
      throw rpcError(`Unrecognized chain ID ${requested ?? '<none>'}`, 4902)
    }

    if (requested !== this.chainIdHex) {
      this.chainIdHex = requested
      this.emit('chainChanged', this.chainIdHex)
    }

    return null
  }

  private async sendTransaction(tx: EthTransaction): Promise<string> {
    const [from] = await this.connectAccounts()
    const chainId = parseInt(this.chainIdHex, 16)
    if (!tx.to) {
      throw rpcError('eth_sendTransaction requires a `to` address', -32602)
    }

    const [nonce, gasPrice, gasLimit] = (await Promise.all([
      tx.nonce ?? this.rpcRequest('eth_getTransactionCount', [from, 'pending']),
      tx.gasPrice ?? this.rpcRequest('eth_gasPrice', []),
      tx.gas ??
        tx.gasLimit ??
        this.rpcRequest('eth_estimateGas', [
          {
            from,
            to: tx.to,
            value: tx.value ?? '0x0',
            data: tx.data ?? '0x'
          }
        ])
    ])) as [string, string, string]

    const trezor = await this.initTrezor()
    const result = await trezor.ethereumSignTransaction({
      path: ETH_DERIVATION_PATH,
      transaction: {
        to: tx.to,
        value: tx.value ?? '0x0',
        gasPrice,
        gasLimit,
        nonce,
        data: tx.data ?? '0x',
        chainId
      }
    })
    if (!result.success) {
      const message = result.payload.error ?? 'Trezor: ethereumSignTransaction failed'
      throw rpcError(message, isUserRejection(message) ? 4001 : -32603)
    }

    const raw = utils.serializeTransaction(
      {
        to: tx.to,
        value: tx.value ?? '0x0',
        gasPrice,
        gasLimit,
        nonce: parseInt(nonce, 16),
        data: tx.data ?? '0x',
        chainId
      },
      {
        r: result.payload.r,
        s: result.payload.s,
        v: parseInt(result.payload.v, 16)
      }
    )

    return (await this.rpcRequest('eth_sendRawTransaction', [raw])) as string
  }

  private async signMessage(message: string): Promise<string> {
    const trezor = await this.initTrezor()
    await this.connectAccounts()
    const hex = message.startsWith('0x')
      ? message.slice(2)
      : Array.from(new TextEncoder().encode(message), byte =>
          byte.toString(16).padStart(2, '0')
        ).join('')
    const result = await trezor.ethereumSignMessage({
      path: ETH_DERIVATION_PATH,
      message: hex,
      hex: true
    })
    if (!result.success) {
      const errorMessage = result.payload.error ?? 'Trezor: ethereumSignMessage failed'
      throw rpcError(errorMessage, isUserRejection(errorMessage) ? 4001 : -32603)
    }
    const signature = result.payload.signature

    return signature.startsWith('0x') ? signature : `0x${signature}`
  }

  private async signTypedData(payload: unknown): Promise<string> {
    const trezor = await this.initTrezor()
    await this.connectAccounts()
    const data =
      typeof payload === 'string'
        ? (JSON.parse(payload) as Record<string, unknown>)
        : (payload as Record<string, unknown>)
    const result = await trezor.ethereumSignTypedData({
      path: ETH_DERIVATION_PATH,
      data,
      metamask_v4_compat: true
    })
    if (!result.success) {
      const errorMessage = result.payload.error ?? 'Trezor: ethereumSignTypedData failed'
      throw rpcError(errorMessage, isUserRejection(errorMessage) ? 4001 : -32603)
    }
    const signature = result.payload.signature

    return signature.startsWith('0x') ? signature : `0x${signature}`
  }

  private async rpcRequest(method: string, params?: unknown[]): Promise<unknown> {
    const rpcUrl = this.rpcUrls.get(this.chainIdHex)
    if (!rpcUrl) {
      throw rpcError(`No RPC endpoint for chain ${this.chainIdHex}`, 4901)
    }

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params: params ?? [] })
    })
    if (!response.ok) {
      throw rpcError(`RPC request failed with status ${response.status}`, -32603)
    }

    const body: { result?: unknown; error?: { message: string; code: number } } =
      await response.json()
    if (body.error) {
      throw rpcError(body.error.message, body.error.code)
    }

    return body.result
  }
}
