import type { WalletWithFeatures } from '@wallet-standard/base'
import type { BitcoinConnectFeature } from '@exodus/bitcoin-wallet-standard'
import type { BitcoinSignTransactionFeature } from './SignTransaction.js'
import type { BitcoinSignMessageFeature } from './SignMessage.js'

/** Type of all Bitcoin features. */
export type BitcoinFeatures = BitcoinConnectFeature &
  BitcoinSignTransactionFeature &
  BitcoinSignMessageFeature

/** Wallet with Bitcoin features. */
export type WalletWithBitcoinFeatures = WalletWithFeatures<BitcoinFeatures>
