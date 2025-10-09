import { registerWallet } from '@wallet-standard/core'
import { announceProvider } from 'mipd'
import { v4 as uuidv4 } from 'uuid'

import { BitcoinProvider } from './core/BitcoinProvider'
import { EvmProvider } from './core/EvmProvider'
import { SolanaProvider } from './core/SolanaProvider'
import { TonProvider } from './core/TonProvider'
import { ConstantsUtil } from './utils/ConstantsUtil'

type TonConnectEvent = {
  event: 'connect' | 'disconnect'
  id: number
  payload: Record<string, unknown>
}

type TonConnectRequest =
  | { method: 'sendTransaction'; params: [Record<string, unknown>]; id: number | string }
  | { method: 'signData'; params: [string | Record<string, unknown>]; id: number | string }
  | { method: 'disconnect'; params?: []; id: number | string }

type TonConnectInjected = {
  tonconnect: {
    _listeners: Array<(event: TonConnectEvent) => void>
    _emit: (event: TonConnectEvent) => void
    connect: () => Promise<string>
    restoreConnection: () => TonConnectEvent
    send: (
      message: TonConnectRequest
    ) => Promise<
      | { boc: string; id: number | string }
      | { signature: string; id: number | string }
      | TonConnectEvent
    >
    listen: (callback: (event: TonConnectEvent) => void) => () => void
    disconnect: () => Promise<TonConnectEvent>
    walletInfo: {
      name: string
      app_name: string
      image: string
      about_url: string
      platforms: string[]
      injected: boolean
      embedded: boolean
    }
    isWalletBrowser: boolean
    protocolVersion: number
  }
}

const evmProvider = new EvmProvider()
const solanaProvider = new SolanaProvider()
const bitcoinProvider = new BitcoinProvider()
const tonProvider = new TonProvider()

// Inject TON provider into window for TonConnect
;(window as unknown as { reownTon: TonConnectInjected }).reownTon = {
  tonconnect: {
    // Simple event system for TonConnect listen()
    _listeners: [] as Array<(event: TonConnectEvent) => void>,
    _emit(event: TonConnectEvent) {
      this._listeners.forEach(cb => {
        try {
          cb(event)
        } catch {
          // Listener error ignored
        }
      })
    },
    connect: async () => {
      tonProvider.connect()
      const address = tonProvider.getAddress()

      const evt: TonConnectEvent = {
        event: 'connect',
        id: Date.now(),
        payload: {
          items: [
            {
              name: 'ton_addr',
              address,
              network: '-3',
              publicKey: tonProvider.keypair.publicKey.toString('hex'),
              walletStateInit: ''
            }
          ],
          device: {
            platform: 'chrome-extension',
            appName: 'Reown',
            appVersion: '1.0.0',
            maxProtocolVersion: 2,
            features: [
              { name: 'SendTransaction', maxMessages: 4 },
              { name: 'SignData', supportedPayloadTypes: ['text', 'binary', 'cell'] }
            ]
          }
        }
      }

      ;(window as unknown as { reownTon: TonConnectInjected }).reownTon.tonconnect._emit(evt)

      return Promise.resolve(address)
    },
    restoreConnection: () => {
      const address = tonProvider.getAddress()

      const evt: TonConnectEvent = {
        event: 'connect',
        id: Date.now(),
        payload: {
          items: [
            {
              name: 'ton_addr',
              address,
              network: '-3',
              publicKey: tonProvider.keypair.publicKey.toString('hex'),
              walletStateInit: ''
            }
          ],
          device: {
            platform: 'chrome-extension',
            appName: 'Reown',
            appVersion: '1.0.0',
            maxProtocolVersion: 2,
            features: [
              { name: 'SendTransaction', maxMessages: 4 },
              { name: 'SignData', supportedPayloadTypes: ['text', 'binary', 'cell'] }
            ]
          }
        }
      }

      ;(window as unknown as { reownTon: TonConnectInjected }).reownTon.tonconnect._emit(evt)

      return evt
    },
    send: async (message: TonConnectRequest) => {
      const { method, params, id } = message

      if (method === 'sendTransaction') {
        const prepared = (params?.[0] as TonProvider.SendMessage['params']) || {
          messages: []
        }
        const boc = await tonProvider.sendMessage(prepared, 'ton:testnet')

        return { boc, id }
      }

      if (method === 'signData') {
        const payloadParam = params?.[0]
        const payload =
          typeof payloadParam === 'string'
            ? (JSON.parse(payloadParam) as TonProvider.SignData['params'])
            : (payloadParam as TonProvider.SignData['params'])
        const result = tonProvider.signData(payload)

        return { signature: result.signature, id }
      }

      if (method === 'disconnect') {
        tonProvider.disconnect()
        const evt: TonConnectEvent = { event: 'disconnect', id: Date.now(), payload: {} }
        ;(
          window as unknown as {
            reownTon: { tonconnect: { _emit: (event: TonConnectEvent) => void } }
          }
        ).reownTon.tonconnect._emit(evt)

        return evt
      }

      throw new Error(`Unsupported method: ${method}`)
    },
    listen: (callback: (event: TonConnectEvent) => void) => {
      const listeners = (window as unknown as { reownTon: TonConnectInjected }).reownTon.tonconnect
        ._listeners as Array<(event: TonConnectEvent) => void>
      listeners.push(callback)

      return () => {
        const idx = listeners.indexOf(callback)
        if (idx >= 0) {
          listeners.splice(idx, 1)
        }
      }
    },
    disconnect: async () => {
      tonProvider.disconnect()
      const evt: TonConnectEvent = { event: 'disconnect', id: Date.now(), payload: {} }
      ;(window as unknown as { reownTon: TonConnectInjected }).reownTon.tonconnect._emit(evt)

      return Promise.resolve(evt)
    },
    walletInfo: {
      name: 'Reown',
      app_name: 'reown',
      image: ConstantsUtil.IconRaw,
      about_url: 'https://reown.com',
      platforms: ['chrome', 'firefox'],
      injected: true,
      embedded: false
    },
    isWalletBrowser: false,
    protocolVersion: 2
  }
}

announceProvider({
  info: {
    icon: ConstantsUtil.IconRaw as `data:image/${string}`,
    name: 'Reown',
    rdns: 'reown.com',
    uuid: uuidv4()
  },
  // We can fix type errors by providing all RPC methods to ReownEvmProvider (EIP1193 provider)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  provider: evmProvider
})

registerWallet(solanaProvider)
registerWallet(bitcoinProvider)
