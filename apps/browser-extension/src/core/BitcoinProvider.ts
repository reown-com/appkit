import ecc from '@bitcoinerlab/secp256k1'
import type { IdentifierArray, WalletAccount } from '@wallet-standard/base'
import BIP32Factory from 'bip32'
import * as bip39 from 'bip39'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import { ECPairFactory } from 'ecpair'

import { AccountUtil } from '../utils/AccountUtil'
import { ConstantsUtil } from '../utils/ConstantsUtil'

bitcoin.initEccLib(ecc)

const mainnetCAIP2 = 'bip122:000000000019d6689c085ae165831e93' as `${string}:${string}`
const testnetCAIP1 = 'bip122:000000000933ea01ad0ee984209779ba' as `${string}:${string}`
const accountFeatures = [
  'bitcoin:connect',
  'standard:events',
  'standard:disconnect',
  'bitcoin:signMessage'
] as IdentifierArray
const mainnetPath = "m/84'/0'/0/0"
const testnetPath = "m/84'/1'/0/0"

// eslint-disable-next-line new-cap
const bip32 = BIP32Factory(ecc)
// eslint-disable-next-line new-cap
const ECPair = ECPairFactory(ecc)
const privateKey = AccountUtil.privateKeyBitcoin
const mnemonic = privateKey ? privateKey : bip39.generateMnemonic()
const seed = bip39.mnemonicToSeedSync(mnemonic)
const root = bip32.fromSeed(seed)

export class BitcoinProvider {
  name = 'Reown'
  version = '1.0.0' as const
  icon = ConstantsUtil.IconRaw as `data:image/png;base64,${string}`
  chains = [mainnetCAIP2, testnetCAIP1]
  isConnected = false
  private listeners: Record<string, ((...args: unknown[]) => void)[]> = {}

  private get activeNetwork(): `${string}:${string}` {
    return (localStorage.getItem('@reown-ext/active-network') ||
      mainnetCAIP2) as `${string}:${string}`
  }

  private set activeNetwork(network: `${string}:${string}`) {
    localStorage.setItem('@reown-ext/active-network', network)
  }

  get accounts(): WalletAccount[] {
    const child = root.derivePath(mainnetPath)
    const testnetChild = root.derivePath(testnetPath)

    return [
      {
        address: bitcoin.payments.p2wpkh({
          pubkey: child.publicKey,
          network: bitcoin.networks.bitcoin
        }).address as string,
        publicKey: child.publicKey,
        chains: [testnetCAIP1, mainnetCAIP2],
        features: accountFeatures
      },
      {
        address: bitcoin.payments.p2wpkh({
          pubkey: testnetChild.publicKey,
          network: bitcoin.networks.testnet
        }).address as string,
        publicKey: testnetChild.publicKey,
        chains: [testnetCAIP1, mainnetCAIP2],
        features: accountFeatures
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
      },
      'bitcoin:signMessage': {
        version: '1.0.0',
        signMessage: this.signMessage.bind(this)
      },
      'bitcoin:switchNetwork': {
        version: '1.0.0',
        switchNetwork: this.switchNetwork.bind(this)
      }
    }
  }

  on(event: string, handler: (...args: unknown[]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(handler)

    return () => (this.listeners[event] = this.listeners[event].filter(h => h !== handler))
  }

  emit(event: string, ...args: unknown[]) {
    ;(this.listeners[event] || []).forEach(handler => handler(...args))
  }

  signIn() {
    return Promise.resolve()
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

  async signMessage({ account, message }: { account: WalletAccount; message: Uint8Array }) {
    if (!this.isConnected) {
      throw new Error('Wallet not connected')
    }

    if (account.address !== this.accounts[0].address) {
      throw new Error('Invalid account')
    }

    const child = root.derivePath(mainnetPath)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keyPair = ECPair.fromPrivateKey(child.privateKey!)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pKey = keyPair.privateKey!

    const messageString = new TextDecoder().decode(message)

    // @ts-expect-error - will fix privatekey type
    const signature = bitcoinMessage.sign(messageString, pKey, keyPair.compressed, {
      segwitType: 'p2wpkh'
    })

    // Return signature as Buffer for proper base64 conversion
    return Promise.resolve([{ signature }])
  }

  switchNetwork(network: `${string}:${string}`) {
    if (network !== mainnetCAIP2 && network !== testnetCAIP1) {
      throw new Error('Unsupported network')
    }
    this.activeNetwork = network
    this.emit('change', { accounts: this.accounts })
  }
}
