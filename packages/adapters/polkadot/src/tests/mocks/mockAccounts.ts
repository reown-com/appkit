import type { InjectedAccountWithMeta } from '../../../src/providers/PolkadotProvider'

export const accountPolkadotJs: InjectedAccountWithMeta = {
  address: '5AAApolkadotJsAddress',
  meta: { name: 'Alice', source: 'polkadot-js' },
  type: 'sr25519'
}

export const accountTalisman: InjectedAccountWithMeta = {
  address: '5BBBtalismanAddress',
  meta: { name: 'Bob', source: 'talisman' },
  type: 'sr25519'
}

export const accountSubwallet: InjectedAccountWithMeta = {
  address: '5CCCsubwalletAddress',
  meta: { name: 'Charlie', source: 'subwallet-js' },
  type: 'sr25519'
}

export const mockAccounts: InjectedAccountWithMeta[] = [
  accountPolkadotJs,
  accountTalisman,
  accountSubwallet
]
