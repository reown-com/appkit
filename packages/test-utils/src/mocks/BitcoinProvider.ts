import { vi } from 'vitest'

import { TestConstants } from '../constants/TestConstants.js'
import { mockUniversalProvider } from './UniversalProvider.js'

/**
 * Mock Bitcoin connector interfaces for testing
 */
export function mockBitcoinConnector(overrides = {}) {
  return {
    chain: 'bip122',
    getAccountAddresses: vi.fn().mockResolvedValue([
      {
        address: TestConstants.accounts.bitcoin[0].address,
        publicKey: TestConstants.accounts.bitcoin[0].publicKey,
        path: TestConstants.accounts.bitcoin[0].path,
        purpose: TestConstants.accounts.bitcoin[0].purpose
      }
    ]),
    signMessage: vi.fn().mockResolvedValue(TestConstants.signatures.bitcoin),
    sendTransfer: vi.fn().mockResolvedValue('txid'),
    signPSBT: vi.fn().mockResolvedValue({
      psbt: 'signedPsbt',
      txid: 'txid'
    }),
    switchNetwork: vi.fn(),
    connect: vi
      .fn()
      .mockRejectedValue(
        new Error('Connection of WalletConnectProvider should be done via UniversalAdapter')
      ),
    disconnect: vi.fn(),
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    emit: vi.fn(),
    chains: [],
    id: 'walletConnect',
    name: 'WalletConnect',
    type: 'WALLET_CONNECT',
    imageId: undefined,
    provider: mockUniversalProvider(),
    ...overrides
  }
}

/**
 * Mock SatsConnect provider for Bitcoin testing
 */
export function mockSatsConnectProvider(overrides = {}) {
  return {
    provider: {
      connect: vi.fn().mockResolvedValue({
        publicKey: TestConstants.accounts.bitcoin[0].publicKey,
        addresses: [
          {
            address: TestConstants.accounts.bitcoin[0].address,
            publicKey: TestConstants.accounts.bitcoin[0].publicKey,
            purpose: TestConstants.accounts.bitcoin[0].purpose
          }
        ]
      }),
      getAddress: vi.fn().mockResolvedValue({
        addresses: [
          {
            address: TestConstants.accounts.bitcoin[0].address,
            publicKey: TestConstants.accounts.bitcoin[0].publicKey,
            purpose: TestConstants.accounts.bitcoin[0].purpose
          }
        ]
      }),
      signMessage: vi.fn().mockResolvedValue({
        signature: TestConstants.signatures.bitcoin
      }),
      signTransaction: vi.fn().mockResolvedValue({
        psbtBase64: 'signedPsbt'
      }),
      getInfo: vi.fn().mockResolvedValue({
        family: 'bitcoin',
        name: 'Leather',
        icon: 'icon-url',
        version: '1.0.0'
      })
    },
    ...overrides
  }
}
