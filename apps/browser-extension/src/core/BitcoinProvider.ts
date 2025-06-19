import ecc from '@bitcoinerlab/secp256k1'
import type { WalletAccount } from '@wallet-standard/base'
import BIP32Factory from 'bip32'
import * as bip39 from 'bip39'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import { ECPairFactory } from 'ecpair'

import { AccountUtil } from '../utils/AccountUtil'
import { ConstantsUtil } from '../utils/ConstantsUtil'

bitcoin.initEccLib(ecc)

// eslint-disable-next-line new-cap
const bip32 = BIP32Factory(ecc)
const ECPair = ECPairFactory(ecc)
const privateKey = AccountUtil.privateKeyBitcoin
const mnemonic = privateKey ? privateKey : bip39.generateMnemonic()
const seed = bip39.mnemonicToSeedSync(mnemonic)
const root = bip32.fromSeed(seed)

export class BitcoinProvider {
  name = 'Reown'
  version = '1.0.0' as const
  icon = ConstantsUtil.IconRaw as `data:image/png;base64,${string}`
  chains = [
    'bip122:000000000019d6689c085ae165831e93' as `${string}:${string}`,
    'bip122:000000000933ea01ad0ee984209779ba' as `${string}:${string}`
  ]
  isConnected = false
  private listeners: Record<string, ((...args: unknown[]) => void)[]> = {}

  private get activeNetwork(): `${string}:${string}` {
    return (localStorage.getItem('@reown-ext/active-network') ||
      'bip122:000000000019d6689c085ae165831e93') as `${string}:${string}`
  }

  private set activeNetwork(network: `${string}:${string}`) {
    localStorage.setItem('@reown-ext/active-network', network)
  }

  private getDerivationPath(): string {
    const isMainnet = this.activeNetwork === 'bip122:000000000019d6689c085ae165831e93'
    return `m/84'/${isMainnet ? '0' : '1'}'/0'/0/0`
  }

  private getDerivedKey() {
    const path = this.getDerivationPath()
    return root.derivePath(path)
  }

  get accounts(): WalletAccount[] {
    const network =
      this.activeNetwork === 'bip122:000000000019d6689c085ae165831e93'
        ? bitcoin.networks.bitcoin
        : bitcoin.networks.testnet

    const child = this.getDerivedKey()

    return [
      {
        address: bitcoin.payments.p2wpkh({
          pubkey: child.publicKey,
          network
        }).address as string,
        publicKey: child.publicKey,
        chains: [this.activeNetwork],
        features: [
          'bitcoin:connect',
          'standard:events',
          'standard:disconnect',
          'bitcoin:signMessage'
        ]
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

    const child = this.getDerivedKey()
    const keyPair = ECPair.fromPrivateKey(child.privateKey!)
    const privateKey = keyPair.privateKey!

    // Convert Uint8Array to string for message signing
    const messageString = new TextDecoder().decode(message)
    console.log('>>> signMessage, messageString:', `'${messageString}'`)

    // Use bitcoin-message signing for P2WPKH addresses
    // @ts-expect-error - will fix privatekey type
    const signature = bitcoinMessage.sign(messageString, privateKey, keyPair.compressed, {
      segwitType: 'p2wpkh'
    })

    console.log('>>> signMessage, signature length:', signature.length)

    // Return signature as Buffer for proper base64 conversion
    return [{ signature: signature }]
  }

  switchNetwork(network: `${string}:${string}`) {
    if (
      network !== 'bip122:000000000019d6689c085ae165831e93' &&
      network !== 'bip122:000000000933ea01ad0ee984209779ba'
    ) {
      throw new Error('Unsupported network')
    }
    this.activeNetwork = network
    this.emit('change', { accounts: this.accounts })
  }
}
