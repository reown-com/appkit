import type { SessionTypes } from '@walletconnect/types'
import { describe, expect, test } from 'vitest'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

import { WcHelpersUtil } from '../../src/utils/HelpersUtil'

const mockEthereumNetwork = {
  id: 1,
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  caipNetworkId: 'eip155:1',
  name: 'Ethereum',
  nativeCurrency: {
    name: 'Ethereum',
    decimals: 18,
    symbol: 'ETH'
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID']
    }
  }
} as const

const mockPolygonNetwork = {
  id: 137,
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  caipNetworkId: 'eip155:137',
  name: 'Polygon',
  nativeCurrency: {
    name: 'Matic',
    decimals: 18,
    symbol: 'MATIC'
  },
  rpcUrls: {
    default: {
      http: ['https://polygon.rpc.com']
    }
  }
} as const

const mockSolanaNetwork = {
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  chainNamespace: ConstantsUtil.CHAIN.SOLANA,
  caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  nativeCurrency: {
    name: 'Solana',
    decimals: 9,
    symbol: 'SOL'
  },
  rpcUrls: {
    default: {
      http: ['https://api.mainnet-beta.solana.com']
    }
  }
} as const

const mockSolanaDevnetNetwork = {
  id: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  chainNamespace: ConstantsUtil.CHAIN.SOLANA,
  caipNetworkId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  name: 'Solana',
  nativeCurrency: {
    name: 'Solana',
    decimals: 9,
    symbol: 'SOL'
  },
  rpcUrls: {
    default: {
      http: ['https://api.mainnet-beta.solana.com']
    }
  }
} as const

describe('WcHelpersUtil', () => {
  describe('getMethodsByChainNamespace', () => {
    test('returns correct methods for solana', () => {
      const methods = WcHelpersUtil.getMethodsByChainNamespace('solana')
      expect(methods).toEqual([
        'solana_signMessage',
        'solana_signTransaction',
        'solana_requestAccounts',
        'solana_getAccounts',
        'solana_signAllTransactions',
        'solana_signAndSendTransaction'
      ])
    })

    test('returns correct methods for eip155', () => {
      const methods = WcHelpersUtil.getMethodsByChainNamespace('eip155')
      expect(methods).toEqual([
        'eth_accounts',
        'eth_requestAccounts',
        'eth_sendRawTransaction',
        'eth_sign',
        'eth_signTransaction',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'eth_sendTransaction',
        'personal_sign',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain',
        'wallet_getPermissions',
        'wallet_requestPermissions',
        'wallet_registerOnboarding',
        'wallet_watchAsset',
        'wallet_scanQRCode',
        // EIP-5792
        'wallet_getCallsStatus',
        'wallet_showCallsStatus',
        'wallet_sendCalls',
        'wallet_getCapabilities',
        // EIP-7715
        'wallet_grantPermissions',
        'wallet_revokePermissions',
        //EIP-7811
        'wallet_getAssets'
      ])
    })

    test('returns empty array for unknown namespace', () => {
      const methods = WcHelpersUtil.getMethodsByChainNamespace('unknown' as any)
      expect(methods).toEqual([])
    })
  })

  describe('createNamespaces', () => {
    test('creates correct namespaces for multiple chains', () => {
      const caipNetworks: CaipNetwork[] = [
        mockEthereumNetwork,
        mockPolygonNetwork,
        mockSolanaNetwork,
        mockSolanaDevnetNetwork
      ]

      const namespaces = WcHelpersUtil.createNamespaces(caipNetworks)

      expect(namespaces).toEqual({
        eip155: {
          methods: expect.arrayContaining([
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
          ]),
          events: ['accountsChanged', 'chainChanged'],
          chains: ['eip155:1', 'eip155:137'],
          rpcMap: {
            '1': 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
            '137': 'https://polygon.rpc.com'
          }
        },
        solana: {
          methods: [
            'solana_signMessage',
            'solana_signTransaction',
            'solana_requestAccounts',
            'solana_getAccounts',
            'solana_signAllTransactions',
            'solana_signAndSendTransaction'
          ],
          events: ['accountsChanged', 'chainChanged'],
          chains: [
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
            'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
            'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
            'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K'
          ],
          rpcMap: {
            '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'https://api.mainnet-beta.solana.com',
            EtWTRABZaYq6iMfeYKouRu166VU2xqa1: 'https://api.mainnet-beta.solana.com'
          }
        }
      })
    })

    test('creates empty namespaces for empty input', () => {
      const namespaces = WcHelpersUtil.createNamespaces([])
      expect(namespaces).toEqual({})
    })
  })

  describe('getChainsFromNamespaces', () => {
    test('returns correct chain ids', () => {
      const namespaces = {
        eip155: {
          methods: [],
          events: [],
          chains: ['eip155:1', 'eip155:137'],
          accounts: ['eip155:4000:0x123', 'eip155:3000:0x456']
        },
        solana: {
          methods: [],
          events: [],
          chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
          accounts: ['solana:mainnet:address', 'solana:devnet:address']
        }
      } as SessionTypes.Namespaces

      expect(WcHelpersUtil.getChainsFromNamespaces(namespaces)).toEqual([
        'eip155:1',
        'eip155:137',
        'eip155:4000',
        'eip155:3000',
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        'solana:mainnet',
        'solana:devnet'
      ])
    })
  })

  describe('isSessionEventData', () => {
    test.each([
      [undefined, false],
      [{}, false],
      [
        {
          id: 1734112958243866,
          topic: 'b2cb2748499532d9c307846c444b364dd881c959d9a080e30d63b6a76270a0f8',
          params: {
            event: {
              name: 'accountsChanged',
              data: ['eip155:1:0x53F31e8972Ebddac1553E37887C25C1b748485A6']
            },
            chainId: 'eip155:1'
          }
        },
        true
      ]
    ])('should validate session event data', (data, expected) => {
      expect(WcHelpersUtil.isSessionEventData(data)).toBe(expected)
    })
  })
})
