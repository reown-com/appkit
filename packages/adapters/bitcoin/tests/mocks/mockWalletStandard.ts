import type { Wallet, WalletAccount } from '@wallet-standard/base'
import type { BitcoinFeatures } from '../../src/utils/wallet-standard/WalletFeatures.js'
import type { StandardEventsOnMethod } from '@wallet-standard/features'
import { vi } from 'vitest'
import { bitcoin } from '@reown/appkit/networks'

export function mockWalletStandardProvider(replaces: Partial<Wallet> = {}): Wallet {
  return {
    accounts: [],
    features: mockWalletStandardProvider.mockFeatures(),
    chains: [bitcoin.caipNetworkId],
    icon: 'data:image/svg+xml;base64,mock',
    name: 'mock_wallet',
    version: '1.0.0',
    ...replaces
  }
}

mockWalletStandardProvider.mockFeatures = (
  replaces: Partial<BitcoinFeatures> = {}
): BitcoinFeatures => ({
  'bitcoin:connect': {
    connect: async () => Promise.resolve({ accounts: [mockWalletStandardProvider.mockAccount()] }),
    version: '1.0.0'
  },
  'bitcoin:signMessage': {
    signMessage: async () =>
      Promise.resolve([{ signature: Uint8Array.from([]), signedMessage: Uint8Array.from([]) }]),
    version: '1.0.0'
  },
  'bitcoin:signTransaction': {
    signTransaction: async () => Promise.resolve([{ signedPsbt: Uint8Array.from([]) }]),
    version: '1.0.0'
  },
  'standard:events': {
    on: vi.fn<StandardEventsOnMethod>(),
    version: '1.0.0'
  },
  ...replaces
})

mockWalletStandardProvider.mockAccount = (
  replaces: Partial<WalletAccount> = {}
): WalletAccount => ({
  address: 'mock_address',
  chains: [bitcoin.caipNetworkId],
  features: [
    'bitcoin:connect',
    'bitcoin:signMessage',
    'bitcoin:signTransaction',
    'standard:events'
  ],
  icon: 'data:image/svg+xml;base64,mock',
  publicKey: Uint8Array.from([]),
  label: 'mock_label',
  ...replaces
})
