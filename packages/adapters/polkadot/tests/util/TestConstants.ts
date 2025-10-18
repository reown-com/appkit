/**
 * Test constants for Polkadot adapter tests
 * Centralizes commonly used values across test files
 */
import {
  MOCK_ACCOUNTS,
  ACCOUNT_SUBWALLET_1,
  ACCOUNT_SUBWALLET_2,
  ACCOUNT_TALISMAN_1,
  ACCOUNT_POLKADOTJS_1,
  getAccountsBySource
} from '../mocks/mockAccounts.js'
import { POLKADOT_MAINNET, KUSAMA_NETWORK, WESTEND_TESTNET, MOCK_NETWORKS } from '../mocks/mockNetworks.js'

// Export accounts
export {
  MOCK_ACCOUNTS,
  ACCOUNT_SUBWALLET_1,
  ACCOUNT_SUBWALLET_2,
  ACCOUNT_TALISMAN_1,
  ACCOUNT_POLKADOTJS_1,
  getAccountsBySource
}

// Export networks
export { POLKADOT_MAINNET, KUSAMA_NETWORK, WESTEND_TESTNET, MOCK_NETWORKS }

// Supported wallet IDs
export const SUPPORTED_WALLETS = ['polkadot-js', 'talisman', 'subwallet-js']

// Wallet source to ID mapping
export const WALLET_SOURCE_TO_ID: Record<string, string> = {
  'subwallet-js': 'subwallet',
  'talisman': 'talisman',
  'polkadot-js': 'polkadot'
}

// Wallet ID to name mapping
export const WALLET_NAMES: Record<string, string> = {
  'polkadot-js': 'Polkadot{.js}',
  'polkadot': 'Polkadot{.js}',
  'talisman': 'Talisman',
  'subwallet-js': 'SubWallet',
  'subwallet': 'SubWallet'
}

// Test message for signing
export const TEST_MESSAGE = 'Hello, Polkadot!'
export const TEST_MESSAGE_HEX = '0x48656c6c6f2c20506f6c6b61646f7421' // hex of "Hello, Polkadot!"

// Default app name
export const DEFAULT_APP_NAME = 'AppKit Polkadot'

// Chain IDs
export const POLKADOT_CHAIN_ID = '91b171bb158e2d3848fa23a9f1c25182'
export const KUSAMA_CHAIN_ID = 'b0a8d493285c2df73290dfb7e61f870f'
export const WESTEND_CHAIN_ID = 'e143f23803ac50e8f6f8e62695d1ce9e'

// Balance test values (in planck/smallest unit)
export const TEST_BALANCE_PLANCK = '5000000000000' // 500 DOT (10 decimals)
export const TEST_BALANCE_FORMATTED = '500.0000' // Expected formatted output

// Kusama balance
export const TEST_BALANCE_KSM_PLANCK = '3000000000000' // 3 KSM (12 decimals)
export const TEST_BALANCE_KSM_FORMATTED = '3.0000'

