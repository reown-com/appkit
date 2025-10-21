import type { RequestArguments } from '@walletconnect/universal-provider'

import type { CaipNetwork } from '@reown/appkit-common'
import { CoreHelperUtil } from '@reown/appkit-controllers'
import type { TonConnector, TonWalletInfo, TonWalletInfoInjectable } from '@reown/appkit-utils/ton'

import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'
import {
  assertSendTransactionSupported,
  assertSignDataSupported,
  connectInjected,
  getJSBridgeKey,
  getTonConnect,
  normalizeBase64
} from '../utils/TonConnectUtil.js'
import { parseUserFriendlyAddress, toUserFriendlyAddress } from '../utils/TonWalletUtils.js'

export class TonConnectConnector implements TonConnector {
  public readonly chain = 'ton'
  public readonly type = 'INJECTED'

  private readonly requestedChains: CaipNetwork[]
  private readonly wallet: TonWalletInfo
  private currentAddress: string | undefined

  private eventEmitter = new ProviderEventEmitter()
  public readonly emit = this.eventEmitter.emit.bind(this.eventEmitter)
  public readonly on = this.eventEmitter.on.bind(this.eventEmitter)
  public readonly removeListener = this.eventEmitter.removeListener.bind(this.eventEmitter)

  constructor({ wallet, chains }: { wallet: TonWalletInfo; chains: CaipNetwork[] }) {
    this.wallet = wallet
    this.requestedChains = chains
  }

  public request<T>(args: RequestArguments) {
    // @ts-expect-error - args type should match internalRequest arguments but it's not correctly typed in Provider
    return this.internalRequest(args) as T
  }

  public get id(): string {
    return this.name
  }

  public get name(): string {
    return this.wallet.name
  }

  public get imageUrl(): string | undefined {
    return this.wallet.imageUrl
  }

  public get chains(): CaipNetwork[] {
    return this.requestedChains
  }

  async connect(): Promise<string> {
    if ('jsBridgeKey' in this.wallet && this.wallet.jsBridgeKey) {
      const address = await connectInjected(this.wallet.jsBridgeKey)
      this.currentAddress = toUserFriendlyAddress(address)

      if (!address) {
        throw new Error('No address available')
      }

      this.emit('accountsChanged', [this.currentAddress])

      return this.currentAddress
    }

    throw new Error('TON remote connect (bridge) not implemented')
  }

  async disconnect(): Promise<void> {
    try {
      if (!CoreHelperUtil.isClient()) {
        return
      }

      const jsBridgeKey = getJSBridgeKey(this.wallet as TonWalletInfoInjectable)
      const wallet = getTonConnect(jsBridgeKey)

      if (!wallet) {
        return
      }

      if (typeof wallet.disconnect === 'function') {
        await wallet.disconnect()
      }

      if (typeof wallet.send === 'function') {
        const id = String(CoreHelperUtil.getUUID())
        wallet.send({ method: 'disconnect', params: [], id })
      }

      this.clearSession()
    } catch {
      // Silently fail disconnect - wallet may already be disconnected
    }
  }

  async signData(params: TonConnector.SignDataParams): Promise<string> {
    if (!CoreHelperUtil.isClient()) {
      return Promise.resolve('')
    }

    const jsBridgeKey = getJSBridgeKey(this.wallet as TonWalletInfoInjectable)

    if (!jsBridgeKey) {
      throw new Error('TON signData over bridge not implemented')
    }

    const wallet = getTonConnect(jsBridgeKey)

    if (!wallet || typeof wallet.send !== 'function') {
      throw new Error('Injected wallet not available')
    }

    const payload = (params || {}) as {
      from?: string
      type?: string
      cell?: string
      bytes?: string
      network?: string
    }
    const { wc, hex } = parseUserFriendlyAddress(payload.from || this.currentAddress || '')
    const from = `${wc}:${hex}`
    const base = { ...payload, from }

    let normalized: Record<string, unknown> = {}
    if (base?.type === 'cell') {
      normalized = { ...base, cell: normalizeBase64(base.cell) }
    } else if (base?.type === 'binary') {
      normalized = { ...base, bytes: normalizeBase64(base.bytes) }
    } else {
      normalized = { ...base, network: base.network || '-239' }
    }

    const requestedType = String(normalized['type'] || '') as 'text' | 'binary' | 'cell'

    if (requestedType === 'text' || requestedType === 'binary' || requestedType === 'cell') {
      try {
        assertSignDataSupported(this.wallet as TonWalletInfoInjectable, [requestedType])
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error ? e.message : `Wallet does not support SignData type: ${requestedType}`
        throw new Error(errorMessage)
      }
    }

    const res = await wallet.send({
      method: 'signData',
      params: [JSON.stringify(normalized)],
      id: CoreHelperUtil.getUUID()
    })

    return res?.signature || (res?.result as { signature?: string } | undefined)?.signature || ''
  }

  async sendMessage(params: TonConnector.SendMessageParams): Promise<string> {
    if (!CoreHelperUtil.isClient()) {
      return Promise.resolve('')
    }

    if (!('jsBridgeKey' in this.wallet) || !this.wallet.jsBridgeKey) {
      throw new Error('TON sendMessage over bridge not implemented')
    }

    const wallet = getTonConnect(this.wallet.jsBridgeKey)

    if (!wallet || typeof wallet.send !== 'function') {
      throw new Error(
        `TonConnectConnector.sendMessage: Injected wallet "${this.wallet.jsBridgeKey}" not available`
      )
    }

    const tx = (params || {}) as {
      validUntil?: number
      from?: string
      network?: string
      messages?: Array<{
        address?: string
        amount?: string | number
        payload?: string
        stateInit?: string
        extraCurrency?: Record<number, string> | undefined
      }>
    }

    const messages = (tx.messages || []).map((m, i) => {
      const amountStr = String(m?.amount ?? '')
      if (!/^[0-9]+$/u.test(amountStr)) {
        throw new Error(`messages[${i}].amount must be a string of digits`)
      }
      if (!m?.address) {
        throw new Error(`messages[${i}].address is required (user-friendly)`)
      }

      return {
        address: m.address,
        amount: amountStr,
        payload: normalizeBase64(m.payload),
        stateInit: normalizeBase64(m.stateInit),
        extra_currency: m.extraCurrency
      }
    })

    if (messages.length === 0) {
      throw new Error('messages must contain at least 1 item')
    }

    const hasExtraCurrencies = (tx.messages || []).some(
      m => m?.extraCurrency && Object.keys(m.extraCurrency).length > 0
    )
    try {
      assertSendTransactionSupported(this.wallet, messages.length, hasExtraCurrencies)
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : 'Wallet does not support SendTransaction'
      throw new Error(errorMessage)
    }

    const connectorInstance = this as unknown as { account?: { address?: string; chain?: string } }
    const from = tx.from ?? connectorInstance.account?.address ?? undefined
    const network = tx.network ?? connectorInstance.account?.chain ?? undefined

    // User-friendly addresses for prepared transaction
    const prepared = {
      valid_until: tx.validUntil ?? Math.floor(Date.now() / 1000) + 60,
      network,
      from,
      messages: (tx.messages || []).map(m => ({
        address: m.address,
        amount: String(m.amount ?? '0')
      }))
    }

    const req = {
      method: 'sendTransaction',
      params: [JSON.stringify(prepared)],
      id: CoreHelperUtil.getUUID()
    }
    const res = await wallet.send(req)

    if (res?.error) {
      throw new Error(res.error.message || `sendTransaction failed (code ${res.error.code})`)
    }

    const boc = res?.result ?? res?.boc

    if (!boc) {
      throw new Error('No boc in response')
    }

    return boc as string
  }

  async switchNetwork(): Promise<void> {
    return Promise.resolve()
  }

  // -- Private ------------------------------------------------------ //
  private clearSession() {
    this.currentAddress = undefined
  }
}
