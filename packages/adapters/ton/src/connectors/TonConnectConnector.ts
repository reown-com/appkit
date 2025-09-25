import type { CaipNetwork } from '@reown/appkit-common'
import type { TonConnector, TonWalletInfo } from '@reown/appkit-utils/ton'

import { toUserFriendlyAddress, userFriendlyToRawAddress } from '../utils/TonWalletUtils'

export class TonConnectConnector implements TonConnector {
  public readonly chain = 'ton'
  public readonly type = 'EXTERNAL'
  public readonly provider = this

  private readonly requestedChains: CaipNetwork[]
  private readonly wallet: TonWalletInfo
  private currentAddress: string | undefined

  constructor({ wallet, chains }: { wallet: TonWalletInfo; chains: CaipNetwork[] }) {
    this.wallet = wallet
    this.requestedChains = chains
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
    // Injected flow
    if ('jsBridgeKey' in this.wallet && this.wallet.jsBridgeKey) {
      const address = await this.connectInjected(this.wallet.jsBridgeKey)
      console.log('[TonConnectConnector] connect: address', address)
      this.currentAddress = toUserFriendlyAddress(address)
      console.log('[TonConnectConnector] connect: address', this.currentAddress)

      return this.currentAddress
    }

    // Remote flow (universal link + bridge) not implemented yet
    throw new Error('TON remote connect (bridge) not implemented')
  }

  async disconnect(): Promise<void> {
    // Injected flow cleanup
    if ('jsBridgeKey' in this.wallet && this.wallet.jsBridgeKey) {
      await this.disconnectInjected(this.wallet.jsBridgeKey)
      return
    }

    // Remote (bridge) flow not implemented yet – clear local state best-effort
    await this.clearSession()
  }

  async getAccount(): Promise<string | undefined> {
    return this.currentAddress
  }

  async signMessage(): Promise<string> {
    throw new Error('TON signMessage not implemented')
  }

  async sendTransaction(params: { transaction: any }): Promise<string> {
    if (!('jsBridgeKey' in this.wallet) || !this.wallet.jsBridgeKey) {
      throw new Error('TON sendTransaction over bridge not implemented')
    }

    const w = typeof window !== 'undefined' ? (window as any) : undefined
    if (!w) throw new Error('Window is not available')
    const api = w[this.wallet.jsBridgeKey]?.tonconnect
    if (!api || typeof api.send !== 'function') throw new Error('Injected wallet not available')

    const tx = params.transaction || {}
    const prepared = {
      valid_until: tx.validUntil ?? Math.floor(Date.now() / 1000) + 60,
      from: tx.from,
      network: tx.network,
      messages: (tx.messages || []).map((m: any) => ({
        address: m.address,
        amount: String(m.amount ?? '0'),
        payload: this.normalizeBase64(m.payload),
        stateInit: this.normalizeBase64(m.stateInit),
        extra_currency: m.extraCurrency
      }))
    }

    const res = await api.send({ method: 'sendTransaction', params: [prepared] })
    return res?.boc as string
  }

  async signData(params: { data: any }): Promise<string> {
    if (!('jsBridgeKey' in this.wallet) || !this.wallet.jsBridgeKey) {
      throw new Error('TON signData over bridge not implemented')
    }

    const w = typeof window !== 'undefined' ? (window as any) : undefined
    if (!w) throw new Error('Window is not available')
    const api = w[this.wallet.jsBridgeKey]?.tonconnect
    if (!api || typeof api.send !== 'function') throw new Error('Injected wallet not available')

    const payload = params.data || {}
    const from = userFriendlyToRawAddress(payload.from || this.currentAddress)
    const base = { ...payload, from }
    const normalized =
      base?.type === 'cell'
        ? { ...base, cell: this.normalizeBase64(base.cell) }
        : base?.type === 'binary'
          ? { ...base, bytes: this.normalizeBase64(base.bytes) }
          : { ...base, network: base.network || '-239' }
    console.log('[TonConnectConnector] signData: params', normalized)

    try {
      const res = await api.send({
        method: 'signData',
        params: [JSON.stringify(normalized)],
        id: 'test'
      })

      console.log('[TonConnectConnector] signData: res', res)
      return (res?.signature || res?.result?.signature) as string
    } catch (error) {
      console.error('[TonConnectConnector] signData: error', error)
      throw error
    }
  }

  async switchNetwork(): Promise<void> {
    return Promise.resolve()
  }

  // -- Private ------------------------------------------------------ //
  private async clearSession() {
    try {
      this.currentAddress = undefined
      try {
        localStorage.removeItem(this.sessionStorageKey())
      } catch {}
    } catch {}
  }

  private async disconnectInjected(jsBridgeKey: string) {
    const w = typeof window !== 'undefined' ? (window as any) : undefined
    if (!w) {
      await this.clearSession()
      return
    }

    const api = w[jsBridgeKey]?.tonconnect
    if (!api) {
      await this.clearSession()
      return
    }

    const onFinally = async () => {
      await this.clearSession()
    }

    try {
      if (typeof api.disconnect === 'function') {
        await api.disconnect()
      } else if (typeof api.send === 'function') {
        await api.send({ method: 'disconnect', params: [] })
      }
    } catch {
      // ignore – still clear local/session state
    } finally {
      await onFinally()
    }
  }

  private getDefaultManifestUrl(): string {
    return 'https://appkit-laboratory-irtfq5uy0-reown-com.vercel.app/ton-manifest.json'
  }

  private createConnectRequest(manifestUrl: string, tonProof?: string) {
    const items: Array<{ name: 'ton_addr' } | { name: 'ton_proof'; payload: string }> = [
      { name: 'ton_addr' }
    ]
    if (tonProof) items.push({ name: 'ton_proof', payload: tonProof })
    return { manifestUrl, items }
  }

  private async connectInjected(jsBridgeKey: string, tonProof?: string): Promise<string> {
    const w = typeof window !== 'undefined' ? (window as any) : undefined
    if (!w) throw new Error('Window is not available')

    const api = w[jsBridgeKey]?.tonconnect
    if (!api) throw new Error(`Injected wallet "${jsBridgeKey}" not available`)

    const manifestUrl = this.getDefaultManifestUrl()
    const request = this.createConnectRequest(manifestUrl, tonProof)
    console.log('[TonConnectConnector] connectInjected: request', request)

    // Optional: try to restore existing session
    try {
      if (typeof api.restoreConnection === 'function') {
        await api.restoreConnection()
      }
    } catch {}

    const PROTOCOL_VERSION = 2

    // Prefer awaiting connect result; if wallet only emits via listen, fallback to listener
    if (typeof api.connect === 'function') {
      try {
        const res = await api.connect(PROTOCOL_VERSION, request)
        const addrItem = res?.payload?.items?.find?.((i: any) => i?.name === 'ton_addr')
        if (res?.event === 'connect' && addrItem?.address) {
          this.persistInjectedSession(jsBridgeKey)
          return addrItem.address as string
        }
      } catch {}
    }

    // Fallback: subscribe then call connect and resolve on first 'connect'
    return await new Promise<string>((resolve, reject) => {
      let unsub: (() => void) | undefined
      const onEvent = (evt: any) => {
        if (evt?.event === 'connect') {
          const addrItem = evt?.payload?.items?.find?.((i: any) => i?.name === 'ton_addr')
          if (addrItem?.address) {
            try {
              unsub?.()
            } catch {}
            resolve(addrItem.address as string)
          }
        } else if (evt?.event === 'connect_error') {
          try {
            unsub?.()
          } catch {}
          reject(new Error(evt?.payload?.message || 'TON connect error'))
        }
      }

      if (typeof api.listen === 'function') {
        unsub = api.listen(onEvent)
      }

      try {
        api.connect(PROTOCOL_VERSION, request)
      } catch (err) {
        try {
          unsub?.()
        } catch {}
        reject(err)
      }
    })
  }

  private normalizeBase64(s?: string): string | undefined {
    if (typeof s !== 'string') return undefined
    const pad = s.length + ((4 - (s.length % 4)) % 4)
    return s.replace(/-/g, '+').replace(/_/g, '/').padEnd(pad, '=')
  }

  // -- Reconnect (Injected) ----------------------------------------- //
  public async restoreConnection(): Promise<string | undefined> {
    console.log('[TonConnectConnector] restoreConnection: start')
    if (!('jsBridgeKey' in this.wallet) || !this.wallet.jsBridgeKey) return undefined
    // Prefer key from persisted session (wallets may rotate keys on reload)
    const persistedKey = this.readPersistedJsBridgeKey()
    const jsBridgeKey = persistedKey || this.wallet.jsBridgeKey
    console.log('[TonConnectConnector] restoreConnection: jsBridgeKey', jsBridgeKey)
    const w = typeof window !== 'undefined' ? (window as any) : undefined
    if (!w) return undefined

    // Wait briefly for the wallet content script to inject
    const api = await this.waitForInjectedApi(jsBridgeKey, 2000)
    console.log('[TonConnectConnector] restoreConnection: api', api)
    if (!api || typeof api.restoreConnection !== 'function') return undefined
    console.log('[TonConnectConnector] restoreConnection: api', api.restoreConnection)

    try {
      const ev = await this.withDeadline(Promise.resolve(api.restoreConnection()), 12_000)
      const addrItem = ev?.payload?.items?.find?.((i: any) => i?.name === 'ton_addr')
      console.log('[TonConnectConnector] restoreConnection: ev', ev)
      if (ev?.event === 'connect' && addrItem?.address) {
        this.persistInjectedSession(jsBridgeKey)
        this.currentAddress = toUserFriendlyAddress(addrItem.address as string)
        return this.currentAddress
      }
      // Clear stale
      this.removeInjectedSession()
    } catch {
      this.removeInjectedSession()
    }

    return undefined
  }

  private persistInjectedSession(jsBridgeKey: string) {
    try {
      localStorage.setItem(
        this.sessionStorageKey(),
        JSON.stringify({ type: 'injected', jsBridgeKey })
      )
    } catch {}
  }

  private removeInjectedSession() {
    try {
      localStorage.removeItem(this.sessionStorageKey())
    } catch {}
  }

  private sessionStorageKey() {
    return 'ak_ton_session'
  }

  private readPersistedJsBridgeKey(): string | undefined {
    try {
      const raw = localStorage.getItem(this.sessionStorageKey())
      if (!raw) return undefined
      const parsed = JSON.parse(raw)
      if (parsed?.type === 'injected' && typeof parsed?.jsBridgeKey === 'string') {
        return parsed.jsBridgeKey as string
      }
    } catch {}
    return undefined
  }

  private async waitForInjectedApi(
    jsBridgeKey: string,
    timeoutMs = 2000
  ): Promise<any | undefined> {
    const w = typeof window !== 'undefined' ? (window as any) : undefined
    if (!w) return undefined
    const start = Date.now()
    const interval = 100
    while (Date.now() - start < timeoutMs) {
      const api = w[jsBridgeKey]?.tonconnect
      if (api) return api
      await new Promise(r => setTimeout(r, interval))
    }
    return w[jsBridgeKey]?.tonconnect
  }

  private withDeadline<T>(p: Promise<T>, ms: number) {
    return Promise.race([
      p,
      new Promise<never>((_, r) => setTimeout(() => r(new Error('deadline')), ms))
    ])
  }
}
