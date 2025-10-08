import type { CaipNetwork } from '@reown/appkit-common'
import { CoreHelperUtil } from '@reown/appkit-controllers'
import type { TonConnector, TonWalletInfo, TonWalletInfoInjectable } from '@reown/appkit-utils/ton'

import { getTonConnectManifestUrl } from '../utils/TonConnectUtil.js'
import { toUserFriendlyAddress, userFriendlyToRawAddress } from '../utils/TonWalletUtils.js'

export class TonConnectConnector implements TonConnector {
  public readonly chain = 'ton'
  public readonly type = 'EXTERNAL'

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
    if ('jsBridgeKey' in this.wallet && this.wallet.jsBridgeKey) {
      const address = await this.connectInjected(this.wallet.jsBridgeKey)
      this.currentAddress = toUserFriendlyAddress(address)

      return this.currentAddress
    }

    throw new Error('TON remote connect (bridge) not implemented')
  }

  async disconnect(): Promise<void> {
    if ((this.wallet as TonWalletInfoInjectable)?.jsBridgeKey) {
      await this.disconnectInjected((this.wallet as TonWalletInfoInjectable).jsBridgeKey)

      return
    }

    await this.clearSession()
  }

  async getAccount(): Promise<string | undefined> {
    return this.currentAddress
  }

  async signMessage(params: { message: string }): Promise<string> {
    return this.signData({
      data: { type: 'text', text: params.message, from: this.currentAddress }
    })
  }

  async sendMessage(params: { message: any }): Promise<string> {
    if (!('jsBridgeKey' in this.wallet) || !this.wallet.jsBridgeKey) {
      throw new Error('TON sendMessage over bridge not implemented')
    }

    if (!CoreHelperUtil.isClient()) {
      throw new Error('Window is not available')
    }

    const wallet = window[this.wallet.jsBridgeKey as keyof Window]?.tonconnect

    if (!wallet || typeof wallet.send !== 'function') {
      throw new Error('Injected wallet not available')
    }

    const tx = params.message || {}
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

    const res = await wallet.send({ method: 'sendTransaction', params: [prepared] })

    return res?.boc as string
  }

  async sendTransaction(params: { transaction: any }): Promise<string> {
    return this.sendMessage({ message: params.transaction })
  }

  async signData(params: { data: any }): Promise<string> {
    if (!CoreHelperUtil.isClient()) {
      throw new Error('Window is not available')
    }

    const jsBridgeKey = (this.wallet as TonWalletInfoInjectable)?.jsBridgeKey || undefined

    if (!jsBridgeKey) {
      throw new Error('TON signData over bridge not implemented')
    }

    const wallet = window[jsBridgeKey as keyof Window]?.tonconnect

    if (!wallet || typeof wallet.send !== 'function') {
      throw new Error('Injected wallet not available')
    }

    const payload = params.data || {}
    const from = userFriendlyToRawAddress(payload.from || this.currentAddress)
    const base = { ...payload, from }
    const normalized =
      base?.type === 'cell'
        ? { ...base, cell: this.normalizeBase64(base.cell) }
        : base?.type === 'binary'
          ? { ...base, bytes: this.normalizeBase64(base.bytes) }
          : { ...base, network: base.network || '-239' }

    try {
      const res = await wallet.send({
        method: 'signData',
        params: [JSON.stringify(normalized)],
        id: CoreHelperUtil.getUUID()
      })

      return (res?.signature || res?.result?.signature) as string
    } catch {}

    return ''
  }

  async switchNetwork(): Promise<void> {
    return Promise.resolve()
  }

  // -- Private ------------------------------------------------------ //
  private async clearSession() {
    this.currentAddress = undefined
  }

  private async disconnectInjected(jsBridgeKey: string) {
    if (!CoreHelperUtil.isClient()) {
      return
    }

    const wallet = window[jsBridgeKey as keyof Window]?.tonconnect

    if (!wallet) {
      return
    }

    if (typeof wallet.disconnect === 'function') {
      await wallet.disconnect()
    } else if (typeof wallet.send === 'function') {
      await wallet.send({ method: 'disconnect', params: [] })
    }
  }

  private createConnectRequest(manifestUrl: string, tonProof?: string) {
    const items: Array<{ name: 'ton_addr' } | { name: 'ton_proof'; payload: string }> = [
      { name: 'ton_addr' }
    ]

    if (tonProof) {
      items.push({ name: 'ton_proof', payload: tonProof })
    }

    return { manifestUrl, items }
  }

  private async connectInjected(jsBridgeKey: string, tonProof?: string): Promise<string> {
    if (!CoreHelperUtil.isClient()) {
      throw new Error('Window is not available')
    }

    const wallet = window[jsBridgeKey as keyof Window]?.tonconnect

    if (!wallet) {
      throw new Error(`Injected wallet "${jsBridgeKey}" not available`)
    }

    const manifestUrl = getTonConnectManifestUrl()
    const request = this.createConnectRequest(manifestUrl, tonProof)

    try {
      if (typeof wallet.restoreConnection === 'function') {
        await wallet.restoreConnection()
      }
    } catch {}

    const PROTOCOL_VERSION = 2

    // Prefer awaiting connect result; if wallet only emits via listen, fallback to listener
    if (typeof wallet.connect === 'function') {
      try {
        const res = await wallet.connect(PROTOCOL_VERSION, request)
        const addrItem = res?.payload?.items?.find?.((i: any) => i?.name === 'ton_addr')
        if (res?.event === 'connect' && addrItem?.address) {
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

      if (typeof wallet.listen === 'function') {
        unsub = wallet.listen(onEvent)
      }

      try {
        wallet.connect(PROTOCOL_VERSION, request)
      } catch (err) {
        try {
          unsub?.()
        } catch {}
        reject(err)
      }
    })
  }

  private normalizeBase64(s?: string): string | undefined {
    if (typeof s !== 'string') {
      return undefined
    }
    const pad = s.length + ((4 - (s.length % 4)) % 4)

    return s.replace(/-/g, '+').replace(/_/g, '/').padEnd(pad, '=')
  }
}
