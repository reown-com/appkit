/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { KeyPair, keyPairFromSecretKey, keyPairFromSeed, sign, signVerify } from '@ton/crypto'
import { Address, TonClient, WalletContractV4, internal } from '@ton/ton'

import { parseUserFriendlyAddress } from '@reown/appkit-adapter-ton/utils'

import { AccountUtil } from '../utils/AccountUtil'

const TON_TESTNET_RPC = 'https://rpc.walletconnect.org/v1'

// Initialize keypair synchronously like other providers
function initKeypair(): KeyPair {
  if (AccountUtil.privateKeyTon) {
    const raw = AccountUtil.privateKeyTon.trim()

    // Accept CSV decimals (e.g., "1, 2, 3, ...") or hex (optionally 0x-prefixed)
    if (raw.includes(',')) {
      const bytes = Buffer.from(raw.split(',').map(v => parseInt(v.trim(), 10)))

      if (bytes.length === 32) {
        return keyPairFromSeed(bytes)
      }
      if (bytes.length === 64) {
        return keyPairFromSecretKey(bytes)
      }

      throw new Error(
        `Invalid TON key length from CSV: ${bytes.length} bytes; expected 32 (seed) or 64 (secretKey)`
      )
    }

    const hex = raw.startsWith('0x') ? raw.slice(2) : raw

    if (!/^[0-9a-fA-F]+$/u.test(hex)) {
      throw new Error('TON_PRIVATE_KEY_1 must be a hex string or CSV decimals')
    }

    const bytes = Buffer.from(hex, 'hex')

    if (bytes.length === 32) {
      return keyPairFromSeed(bytes)
    }
    if (bytes.length === 64) {
      return keyPairFromSecretKey(bytes)
    }

    throw new Error(
      `Invalid TON key length from hex: ${bytes.length} bytes; expected 32 (seed) or 64 (secretKey)`
    )
  }

  // Generate random keypair using crypto.getRandomValues
  const seed = crypto.getRandomValues(new Uint8Array(32))
  const keypair = Buffer.from(seed)

  return keyPairFromSeed(keypair)
}

const keypair = initKeypair()

export class TonProvider {
  keypair: KeyPair
  wallet: WalletContractV4
  version = '1.0.0'
  isConnected = false

  constructor() {
    this.keypair = keypair
    this.wallet = WalletContractV4.create({ workchain: 0, publicKey: keypair.publicKey })
  }

  public getAddress() {
    const { wc, hex } = parseUserFriendlyAddress(this.wallet.address.toString())

    return `${wc}:${hex}`
  }

  public connect(): string {
    this.isConnected = true

    return this.getAddress()
  }

  public disconnect(): void {
    this.isConnected = false
  }

  public getSecretKey() {
    return this.keypair.secretKey.toString('hex')
  }

  public signMessage(params: TonProvider.SignMessage['params']): TonProvider.SignMessage['result'] {
    const signature = sign(Buffer.from(params.message), this.keypair.secretKey)

    return {
      signature: signature.toString('base64'),
      publicKey: this.keypair.publicKey.toString('base64')
    }
  }

  public async sendMessage(
    params: TonProvider.SendMessage['params'],
    chainId: string
  ): Promise<TonProvider.SendMessage['result']> {
    const client = this.getTonClient()
    const walletContract = client.open(this.wallet)
    const seqno = await walletContract.getSeqno()
    const messages = (params.messages || []).map(m => {
      const amountBigInt = typeof m.amount === 'string' ? BigInt(m.amount) : BigInt(m.amount)

      return internal({
        to: Address.parse(m.address),
        value: amountBigInt,
        body: 'Test transfer from TON WalletConnect'
      })
    })

    const transfer = walletContract.createTransfer({
      seqno,
      secretKey: this.keypair.secretKey,
      messages
    })

    // Send the transfer
    await walletContract.sendTransfer({
      seqno,
      secretKey: this.keypair.secretKey,
      messages
    })

    return transfer.toBoc().toString('base64')
  }

  public signData(params: TonProvider.SignData['params']): TonProvider.SignData['result'] {
    const payload: TonProvider.SignData['params'] = params

    const dataToSign = this.getToSign(params)
    const signature = sign(dataToSign, this.keypair.secretKey as unknown as Buffer)
    const addressStr = this.wallet.address.toString()

    const result = {
      signature: signature.toString('base64'),
      address: addressStr,
      publicKey: this.keypair.publicKey.toString('base64'),
      timestamp: Math.floor(Date.now() / 1000),
      // eslint-disable-next-line no-negated-condition
      domain: typeof window !== 'undefined' ? (window.location?.hostname ?? 'unknown') : 'unknown',
      payload
    }

    try {
      const isVerified = signVerify(
        dataToSign,
        Buffer.from(result.signature, 'base64'),
        this.keypair.publicKey
      )
      // eslint-disable-next-line no-console
      console.log('TON signData verified:', isVerified)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('TON signData verification failed to run', e)
    }

    return result
  }

  private getTonClient(): TonClient {
    return new TonClient({ endpoint: TON_TESTNET_RPC })
  }

  private getToSign(params: TonProvider.SignData['params']): Buffer {
    if (params.type === 'text') {
      return Buffer.from(params.text)
    } else if (params.type === 'binary') {
      return Buffer.from(params.bytes, 'base64')
    } else if (params.type === 'cell') {
      return Buffer.from(params.cell, 'base64')
    }

    throw new Error('Unsupported sign data type')
  }

  public createTonConnectInterface(walletIcon: string) {
    const listeners: Array<(event: TonConnectEvent) => void> = []
    // eslint-disable-next-line func-style
    const emit = (event: TonConnectEvent) => {
      listeners.forEach(cb => {
        try {
          cb(event)
        } catch {
          // Listener error ignored
        }
      })
    }

    const createConnectEvent = (): TonConnectEvent => {
      const address = this.getAddress()

      return {
        event: 'connect',
        id: Date.now(),
        payload: {
          items: [
            {
              name: 'ton_addr',
              address,
              network: '-3',
              publicKey: this.keypair.publicKey.toString('hex'),
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
    }

    return {
      _listeners: listeners,
      _emit: emit,
      connect: async (): Promise<string> => {
        this.connect()
        const address = this.getAddress()
        const evt = createConnectEvent()
        emit(evt)

        return Promise.resolve(address)
      },
      restoreConnection: (): TonConnectEvent => {
        const evt = createConnectEvent()
        emit(evt)

        return evt
      },
      send: async (
        message: TonConnectRequest
      ): Promise<
        | { boc: string; id: number | string }
        | { signature: string; id: number | string }
        | TonConnectEvent
      > => {
        const { method, params, id } = message

        if (method === 'sendTransaction') {
          const prepared = (params?.[0] as TonProvider.SendMessage['params']) || {
            messages: []
          }
          const boc = await this.sendMessage(prepared, 'ton:testnet')

          return { boc, id }
        }

        if (method === 'signData') {
          const payloadParam = params?.[0]
          const payload =
            typeof payloadParam === 'string'
              ? (JSON.parse(payloadParam) as TonProvider.SignData['params'])
              : (payloadParam as TonProvider.SignData['params'])
          const result = this.signData(payload)

          return { signature: result.signature, id }
        }

        if (method === 'disconnect') {
          this.disconnect()
          const evt: TonConnectEvent = { event: 'disconnect', id: Date.now(), payload: {} }
          emit(evt)

          return evt
        }

        throw new Error(`Unsupported method: ${method}`)
      },
      listen: (callback: (event: TonConnectEvent) => void): (() => void) => {
        listeners.push(callback)

        return () => {
          const idx = listeners.indexOf(callback)
          if (idx >= 0) {
            listeners.splice(idx, 1)
          }
        }
      },
      disconnect: async (): Promise<TonConnectEvent> => {
        this.disconnect()
        const evt: TonConnectEvent = { event: 'disconnect', id: Date.now(), payload: {} }
        emit(evt)

        return Promise.resolve(evt)
      },
      walletInfo: {
        name: 'Reown',
        app_name: 'reown',
        image: walletIcon,
        about_url: 'https://reown.com',
        platforms: ['chrome', 'firefox'],
        injected: true,
        embedded: false
      },
      isWalletBrowser: false,
      protocolVersion: 2
    }
  }
}

export namespace TonProvider {
  type RPCRequest<Params, Result> = {
    params: Params
    result: Result
  }

  export type SignMessage = RPCRequest<
    { message: string },
    { signature: string; publicKey: string }
  >

  export type SendMessage = RPCRequest<
    {
      valid_until?: number
      from?: string
      messages: Array<{
        address: string
        amount: number | string
        payload?: string
        stateInit?: string
        extra_currency?: Record<string, string | number>
      }>
    },
    string
  >

  export type SignData = RPCRequest<
    | { type: 'text'; text: string; from?: string }
    | { type: 'binary'; bytes: string; from?: string }
    | { type: 'cell'; schema: string; cell: string; from?: string },
    {
      signature: string
      address: string
      publicKey: string
      timestamp: number
      domain: string
      payload: unknown
    }
  >
}

export type TonConnectEvent = {
  event: 'connect' | 'disconnect'
  id: number
  payload: Record<string, unknown>
}

export type TonConnectRequest =
  | { method: 'sendTransaction'; params: [Record<string, unknown>]; id: number | string }
  | { method: 'signData'; params: [string | Record<string, unknown>]; id: number | string }
  | { method: 'disconnect'; params?: []; id: number | string }
