import type { SessionTypes } from '@walletconnect/types'
import type UniversalProvider from '@walletconnect/universal-provider'
import { vi } from 'vitest'

import type { BitcoinConnector } from '@reown/appkit-utils/bitcoin'
import { bitcoin } from '@reown/appkit/networks'

export function mockUniversalProvider(
  replaces: Partial<UniversalProvider> = {}
): UniversalProvider {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    request: vi.fn(),
    on: vi.fn(),
    client: {
      core: {
        crypto: {
          getClientId: vi.fn(() => Promise.resolve('client-id'))
        }
      }
    },
    setDefaultChain: vi.fn(),
    ...replaces
  } as UniversalProvider
}

export function mockBitcoinConnector(): BitcoinConnector {
  return {
    chain: 'bip122',
    getAccountAddresses: vi.fn().mockResolvedValue([
      {
        address: 'bc1qtest',
        publicKey: '0123456789abcdef',
        path: "m/84'/0'/0'/0/0",
        purpose: 'payment'
      }
    ]),
    signMessage: vi.fn().mockResolvedValue('base64signature'),
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
    provider: mockUniversalProvider()
  } as BitcoinConnector
}

mockUniversalProvider.mockSession = (
  replaces: Partial<SessionTypes.Struct> = {}
): SessionTypes.Struct => ({
  acknowledged: false,
  authentication: [],
  controller: '',
  expiry: 0,
  namespaces: {
    bip122: {
      accounts: [`${bitcoin.caipNetworkId}:address`],
      events: [],
      methods: ['sendTransfer', 'signMessage', 'signPsbt', 'getAccountAddresses']
    }
  },
  optionalNamespaces: {},
  requiredNamespaces: {},
  pairingTopic: '',
  peer: {
    metadata: {
      description: '',
      url: '',
      icons: [],
      name: '',
      redirect: undefined,
      verifyUrl: ''
    },
    publicKey: ''
  },
  relay: {
    protocol: '',
    data: undefined
  },
  self: {
    metadata: {
      description: '',
      url: '',
      icons: [],
      name: '',
      redirect: undefined,
      verifyUrl: ''
    },
    publicKey: ''
  },
  topic: '',
  ...replaces
})
