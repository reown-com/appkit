import BIP32Factory, { BIP32Interface } from 'bip32'
import * as bip39 from 'bip39'
import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'

import { AccountUtil } from '../utils/AccountUtil'
import { ConstantsUtil } from '../utils/ConstantsUtil'

bitcoin.initEccLib(ecc)

const bip32 = BIP32Factory(ecc)
const privateKey = AccountUtil.privateKeyBitcoin
const mnemonic = privateKey ? privateKey : bip39.generateMnemonic()
const seed = bip39.mnemonicToSeedSync(mnemonic)
const root = bip32.fromSeed(seed)

export class BitcoinProvider {
  name = 'Reown'
  version = '1.0.0' as const
  icon = ConstantsUtil.IconRaw as `data:image/png;base64,${string}`

  private account: BIP32Interface = bip32.fromBase58(root.toBase58())
  private address: string

  constructor() {
    const path = `m/84'/0'/0'/1/0`
    const child = this.account.derivePath(path)
    this.address = bitcoin.payments.p2tr({
      pubkey: child.publicKey.slice(1),
      network: bitcoin.networks.bitcoin
    }).address!
  }

  connect() {
    return Promise.resolve(this.address)
  }

  getBalance(address: string) {
    return 0
  }

  getAddress() {
    return this.address
  }
}
