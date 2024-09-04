import type UniversalProvider from '@walletconnect/universal-provider'
import { vi } from 'vitest'

export const mockProvider = {
  on: vi.fn(),
  off: vi.fn(),
  disconnect: vi.fn(),
  request: vi.fn(),
  setDefaultChain: vi.fn(),
  namespaces: {
    eip155: {
      chains: ['eip155:1'],
      events: ['accountsChanged', 'chainChanged'],
      methods: [
        'personal_sign',
        'eth_sign',
        'eth_signTransaction',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'eth_sendRawTransaction',
        'eth_sendTransaction',
        'wallet_getCapabilities',
        'wallet_sendCalls',
        'wallet_showCallsStatus',
        'wallet_getCallsStatus',
        'wallet_switchEthereumChain'
      ],
      rpcMap: {
        '1': 'https://rpc.walletconnect.org/v1/?chainId=eip155:1&projectId=undefined'
      }
    },
    solana: {
      chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      methods: ['solana_signMessage'],
      events: ['accountsChanged', 'chainChanged'],
      rpcMap: {
        '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'https://rpc.walletconnect.org/v1'
      }
    }
  },

  session: {
    topic: 'mock_session_topic',
    namespaces: {
      eip155: {
        chains: ['eip155:1'],
        accounts: ['eip155:1:0xE62a3eD41B21447b67a63880607CD2E746A0E35d'],
        methods: ['eth_sendTransaction', 'personal_sign'],
        events: ['accountsChanged', 'chainChanged']
      },
      solana: {
        chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
        accounts: [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:CxELquR1gPP8wHe33gZ4QxqGB3sZ9RSwGMgmR69MfN5B'
        ],
        methods: ['solana_signTransaction', 'solana_signMessage'],
        events: ['accountChanged']
      }
    },
    expiry: 1234567890,
    acknowledged: true,
    controller: 'mock_controller',
    peer: {
      publicKey: 'mock_public_key',
      metadata: {
        name: 'Mock Wallet',
        description: 'Mock Wallet Description',
        url: 'https://mockwallet.com',
        icons: ['https://mockwallet.com/icon.png']
      }
    }
  },
  client: {
    formatAuthMessage: vi.fn().mockReturnValue('Formatted auth message'),
    core: {
      pairing: {
        getPairings: vi.fn().mockReturnValue([])
      },
      crypto: {
        keychain: {
          has: vi.fn().mockResolvedValue(true),
          set: vi.fn()
        }
      },
      relayer: {
        subscriber: {
          context: '0x1234'
        }
      }
    }
  },
  events: {
    emit: vi.fn()
  },
  rpcProviders: {
    eip155: {
      request: vi.fn()
    },
    solana: {
      request: vi.fn()
    }
  },
  providerOpts: {
    client: {
      projectId: 'mock_project_id',
      relayUrl: 'wss://relay.walletconnect.com'
    },
    qrcode: true
  },
  connect: vi.fn().mockResolvedValue({
    uri: 'wc:mock_uri',
    approval: Promise.resolve({})
  }),
  authenticate: vi.fn().mockResolvedValue({
    uri: 'wc:mock_auth_uri',
    approval: Promise.resolve({})
  }),
  enable: vi.fn().mockResolvedValue(['0x1234...'])
} as unknown as UniversalProvider

export default mockProvider
