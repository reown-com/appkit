import type { BitcoinConnectFeature } from '@exodus/bitcoin-wallet-standard'
import type { WalletWithFeatures } from '@wallet-standard/base'
import type { StandardEventsFeature } from '@wallet-standard/features'

import type { BitcoinSignMessageFeature } from './SignMessage.js'
import type { BitcoinSignTransactionFeature } from './SignTransaction.js'

/** Type of all Bitcoin features. */
export type BitcoinFeatures = BitcoinConnectFeature &
  BitcoinSignTransactionFeature &
  BitcoinSignMessageFeature &
  StandardEventsFeature

/** Wallet with Bitcoin features. */
export type WalletWithBitcoinFeatures = WalletWithFeatures<BitcoinFeatures>
