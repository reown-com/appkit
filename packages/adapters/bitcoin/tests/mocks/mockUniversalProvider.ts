import type { SessionTypes } from '@walletconnect/types'
import type UniversalProvider from '@walletconnect/universal-provider'
import { vi } from 'vitest'

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
  requiredNamespaces: {},
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
