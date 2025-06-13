import type { WalletAccount } from '@wallet-standard/base'

import { SOLANA_CHAINS } from './constants.js'

/** Type of all Solana clusters */
export type SolanaChain = (typeof SOLANA_CHAINS)[number]

export class WalletConnectAccount implements WalletAccount {
  readonly #address: WalletAccount['address']
  readonly #publicKey: WalletAccount['publicKey']
  readonly #chains: WalletAccount['chains']
  readonly #features: WalletAccount['features']
  readonly #label: WalletAccount['label']
  readonly #icon: WalletAccount['icon']

  get address() {
    return this.#address
  }

  get publicKey() {
    return this.#publicKey.slice()
  }

  get chains() {
    return this.#chains.slice()
  }

  get features() {
    return this.#features.slice()
  }

  get label() {
    return this.#label
  }

  get icon() {
    return this.#icon
  }

  constructor({ address, publicKey, label, icon }: Omit<WalletAccount, 'chains' | 'features'>) {
    this.#address = address
    this.#publicKey = publicKey
    this.#chains = SOLANA_CHAINS
    this.#features = [
      'solana:signAndSendTransaction',
      'solana:signTransaction',
      'solana:signMessage'
    ]
    this.#label = label
    this.#icon = icon
  }
}
