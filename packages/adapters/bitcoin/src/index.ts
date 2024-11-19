import type { Provider as SatsConnectProvider } from 'sats-connect'
import type { Wallet as BitcoinWalletStandardProvider } from '@wallet-standard/base'

export * from './adapter.js'

export type BitcoinProvider = SatsConnectProvider | BitcoinWalletStandardProvider
