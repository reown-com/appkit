/**
 * Mock Polkadot accounts for testing
 * Simulates accounts from different wallet extensions
 */

export interface InjectedAccountWithMeta {
  address: string
  meta: {
    source: string
    name?: string
    genesisHash?: string
  }
  type?: 'sr25519' | 'ed25519' | 'ecdsa'
}

// SubWallet accounts
export const ACCOUNT_SUBWALLET_1: InjectedAccountWithMeta = {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  meta: {
    source: 'subwallet-js',
    name: 'Alice SubWallet'
  },
  type: 'sr25519'
}

export const ACCOUNT_SUBWALLET_2: InjectedAccountWithMeta = {
  address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  meta: {
    source: 'subwallet-js',
    name: 'Bob SubWallet'
  },
  type: 'sr25519'
}

// Talisman account
export const ACCOUNT_TALISMAN_1: InjectedAccountWithMeta = {
  address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
  meta: {
    source: 'talisman',
    name: 'Charlie Talisman'
  },
  type: 'sr25519'
}

// Polkadot.js account
export const ACCOUNT_POLKADOTJS_1: InjectedAccountWithMeta = {
  address: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
  meta: {
    source: 'polkadot-js',
    name: 'Dave Polkadot'
  },
  type: 'sr25519'
}

// All mock accounts
export const MOCK_ACCOUNTS: InjectedAccountWithMeta[] = [
  ACCOUNT_SUBWALLET_1,
  ACCOUNT_SUBWALLET_2,
  ACCOUNT_TALISMAN_1,
  ACCOUNT_POLKADOTJS_1
]

// Helper to filter accounts by source
export function getAccountsBySource(source: string): InjectedAccountWithMeta[] {
  return MOCK_ACCOUNTS.filter(acc => acc.meta.source === source)
}

