/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { KeyPair, keyPairFromSecretKey, keyPairFromSeed, sign, signVerify } from '@ton/crypto'
import { Address, TonClient, WalletContractV4, internal } from '@ton/ton'

import { AccountUtil } from '../utils/AccountUtil'
import { userFriendlyToRawAddress } from '../utils/TonWalletUtils'

const TON_TESTNET_RPC = 'https://testnet.toncenter.com/api/v2/jsonRPC'
const TON_MAINNET_RPC = 'https://toncenter.com/api/v2/jsonRPC'

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
    return userFriendlyToRawAddress(this.wallet.address.toString())
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
    const client = this.getTonClient(chainId)
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

  private getTonClient(chainId: string): TonClient {
    const rpc = chainId.includes('testnet') ? TON_TESTNET_RPC : TON_MAINNET_RPC

    if (!rpc) {
      throw new Error('There is no RPC URL for the provided chain')
    }

    return new TonClient({
      endpoint: rpc
    })
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
