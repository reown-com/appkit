import ecc from '@bitcoinerlab/secp256k1'
import type { WalletAccount } from '@wallet-standard/base'
import BIP32Factory from 'bip32'
import * as bip39 from 'bip39'
import * as bitcoin from 'bitcoinjs-lib'

import { AccountUtil } from '../utils/AccountUtil'
import { ConstantsUtil } from '../utils/ConstantsUtil'

bitcoin.initEccLib(ecc)

const bip32 = BIP32Factory(ecc)
const privateKey = AccountUtil.privateKeyBitcoin
const mnemonic = privateKey ? privateKey : bip39.generateMnemonic()
const seed = bip39.mnemonicToSeedSync(mnemonic)
const root = bip32.fromSeed(seed)
const path = `m/84'/0'/0'/1/0`
const child = root.derivePath(path)

export class BitcoinProvider {
  name = 'Reown'
  version = '1.0.0' as const
  icon = ConstantsUtil.IconRaw as `data:image/png;base64,${string}`
  chains = ['bip122:000000000019d6689c085ae165831e93' as `${string}:${string}`]
  isConnected = false

  // Event system
  private listeners: { [event: string]: ((...args: any[]) => void)[] } = {}

  get accounts(): WalletAccount[] {
    return [
      {
        address: bitcoin.payments.p2tr({
          pubkey: child.publicKey.slice(1),
          network: bitcoin.networks.bitcoin
        }).address!,
        publicKey: child.publicKey,
        chains: ['bip122:000000000019d6689c085ae165831e93'],
        features: ['bitcoin:connect', 'standard:events', 'standard:disconnect']
      }
    ]
  }

  public get features() {
    return {
      'bitcoin:connect': {
        version: '1.0.0',
        connect: this.connect.bind(this)
      },
      'standard:events': {
        version: '1.0.0',
        on: this.on.bind(this)
      },
      'standard:disconnect': {
        version: '1.0.0',
        disconnect: this.disconnect.bind(this)
      }
    }
  }

  on(event: string, handler: (...args: any[]) => void) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(handler)
    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler)
    }
  }

  emit(event: string, ...args: any[]) {
    ;(this.listeners[event] || []).forEach(handler => handler(...args))
  }

  async connect() {
    this.isConnected = true
    this.emit('change', { accounts: this.accounts })
    return Promise.resolve({ accounts: this.accounts })
  }

  async disconnect() {
    this.isConnected = false
    this.emit('change', { accounts: [] })
    this.emit('disconnect')
    return Promise.resolve()
  }
}
