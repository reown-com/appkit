import { registerWallet } from '@wallet-standard/core'
import { announceProvider } from 'mipd'
import { v4 as uuidv4 } from 'uuid'

import { BitcoinProvider } from './core/BitcoinProvider'
import { EvmProvider } from './core/EvmProvider'
import { SolanaProvider } from './core/SolanaProvider'
import { TonProvider } from './core/TonProvider'
import { ConstantsUtil } from './utils/ConstantsUtil'

const evmProvider = new EvmProvider()
const solanaProvider = new SolanaProvider()
const bitcoinProvider = new BitcoinProvider()
const tonProvider = new TonProvider()

// Inject TON provider into window for TonConnect
;(window as any).reownTon = {
  tonconnect: {
    // Simple event system for TonConnect listen()
    _listeners: [] as Array<(event: any) => void>,
    _emit(event: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this._listeners as any[]).forEach(cb => {
        try {
          cb(event)
        } catch {}
      })
    },
    connect: async (protocolVersion: number, message: any) => {
      console.log('>>> bx tonconnect connect')
      await tonProvider.connect()
      const address = tonProvider.getAddress()
      console.log('>>> address', address)

      const evt = {
        event: 'connect',
        id: Date.now(),
        payload: {
          items: [
            {
              name: 'ton_addr',
              address,
              network: '-3', // testnet
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

      // Emit for listeners and return for direct-await usage
      ;(window as any).reownTon.tonconnect._emit(evt)

      return address
    },
    restoreConnection: async () => {
      const address = tonProvider.getAddress()

      const evt = {
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

      ;(window as any).reownTon.tonconnect._emit(evt)

      return evt
    },
    send: async (message: any) => {
      const { method, params, id } = message

      if (method === 'sendTransaction') {
        const prepared = params?.[0] || {}
        const boc = await tonProvider.sendMessage(prepared, 'ton:testnet')

        return { boc, id }
      }

      if (method === 'signData') {
        const payloadParam = params?.[0]
        const payload = typeof payloadParam === 'string' ? JSON.parse(payloadParam) : payloadParam
        const result = await tonProvider.signData(payload)

        return { signature: result.signature, id }
      }

      if (method === 'disconnect') {
        await tonProvider.disconnect()
        const evt = { event: 'disconnect', id: Date.now(), payload: {} }
        ;(window as any).reownTon.tonconnect._emit(evt)

        return evt
      }

      throw new Error(`Unsupported method: ${method}`)
    },
    listen: (callback: (event: any) => void) => {
      const listeners = (window as any).reownTon.tonconnect._listeners as Array<
        (event: any) => void
      >
      listeners.push(callback)

      return () => {
        const idx = listeners.indexOf(callback)
        if (idx >= 0) listeners.splice(idx, 1)
      }
    },
    disconnect: async () => {
      await tonProvider.disconnect()
      const evt = { event: 'disconnect', id: Date.now(), payload: {} }
      ;(window as any).reownTon.tonconnect._emit(evt)

      return evt
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
