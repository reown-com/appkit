import type { SessionTypes } from '@walletconnect/types'
import { describe, expect, test } from 'vitest'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

import { WcConstantsUtil } from '../../src/utils/ConstantsUtil'
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

  describe('createDefaultNamespace', () => {
    test('creates correct namespace structure for solana', () => {
      const namespace = WcHelpersUtil.createDefaultNamespace('solana')
      expect(namespace).toEqual({
        methods: [
          'solana_signMessage',
          'solana_signTransaction',
          'solana_requestAccounts',
          'solana_getAccounts',
          'solana_signAllTransactions',
          'solana_signAndSendTransaction'
        ],
        events: ['accountsChanged', 'chainChanged'],
        chains: [],
        rpcMap: {}
      })
    })

    test('creates correct namespace structure for eip155', () => {
      const namespace = WcHelpersUtil.createDefaultNamespace('eip155')
      expect(namespace).toEqual({
        methods: expect.arrayContaining([
          'personal_sign',
          'eth_sign',
          'eth_signTransaction',
          'eth_signTypedData',
          'eth_sendTransaction',
          'wallet_switchEthereumChain'
        ]),
        events: ['accountsChanged', 'chainChanged'],
        chains: [],
        rpcMap: {}
      })
    })

    test('creates namespace with empty methods for unknown chain namespace', () => {
      const namespace = WcHelpersUtil.createDefaultNamespace('unknown' as any)
      expect(namespace).toEqual({
        methods: [],
        events: ['accountsChanged', 'chainChanged'],
        chains: [],
        rpcMap: {}
      })
    })
  })

  describe('applyNamespaceOverrides', () => {
    test('returns a copy of baseNamespaces when overrides is undefined', () => {
      const baseNamespaces = {
        eip155: {
          methods: ['eth_sign'],
          events: ['accountsChanged'],
          chains: ['eip155:1'],
          rpcMap: { '1': 'https://ethereum.rpc.com' }
        }
      }

      const result = WcHelpersUtil.applyNamespaceOverrides(baseNamespaces, undefined)

      // Should return a copy, not the original object
      expect(result).not.toBe(baseNamespaces)
      expect(result).toEqual(baseNamespaces)
    })

    test('handles empty overrides object', () => {
      const baseNamespaces = {
        eip155: {
          methods: ['eth_sign'],
          events: ['accountsChanged'],
          chains: ['eip155:1'],
          rpcMap: { '1': 'https://ethereum.rpc.com' }
        }
      }

      const result = WcHelpersUtil.applyNamespaceOverrides(baseNamespaces, {})

      expect(result).toEqual(baseNamespaces)
    })

    test('creates new namespace that does not exist in base when referenced in multiple override types', () => {
      const baseNamespaces = {
        eip155: {
          methods: ['eth_sign'],
          events: ['accountsChanged'],
          chains: ['eip155:1'],
          rpcMap: { '1': 'https://ethereum.rpc.com' }
        }
      }

      const result = WcHelpersUtil.applyNamespaceOverrides(baseNamespaces, {
        methods: { cosmos: ['cosmos_method'] },
        chains: { cosmos: ['cosmos:cosmoshub-4'] },
        events: { cosmos: ['cosmos_event'] },
        rpcMap: { 'cosmos:cosmoshub-4': 'https://cosmos-hub.rpc.com' }
      })

      expect(result['cosmos']).toBeDefined()
      expect(result['cosmos']?.methods).toEqual(['cosmos_method'])
      expect(result['cosmos']?.chains).toEqual(['cosmos:cosmoshub-4'])
      expect(result['cosmos']?.events).toEqual(['cosmos_event'])
      expect(result['cosmos']?.rpcMap).toEqual({ 'cosmoshub-4': 'https://cosmos-hub.rpc.com' })

      // Original namespace should remain unchanged
      expect(result['eip155']).toEqual(baseNamespaces['eip155'])
    })

    test('handles missing rpcMap in base namespace when applying rpcMap overrides', () => {
      const baseNamespaces = {
        eip155: {
          methods: ['eth_sign'],
          events: ['accountsChanged'],
          chains: ['eip155:1']
        }
      }

      const result = WcHelpersUtil.applyNamespaceOverrides(baseNamespaces, {
        rpcMap: { 'eip155:42': 'https://kovan.rpc.com' }
      })

      expect(result['eip155']?.rpcMap).toEqual({ '42': 'https://kovan.rpc.com' })
    })

    test('applies method overrides for existing namespace', () => {
      const baseNamespaces = {
        eip155: {
          methods: ['eth_sign', 'personal_sign'],
          events: ['accountsChanged', 'chainChanged'],
          chains: ['eip155:1'],
          rpcMap: { '1': 'https://ethereum.rpc.com' }
        }
      }

      const result = WcHelpersUtil.applyNamespaceOverrides(baseNamespaces, {
        methods: { eip155: ['new_method1', 'new_method2'] }
      })

      expect(result['eip155']?.methods).toEqual(['new_method1', 'new_method2'])
      // Other properties should remain unchanged
      expect(result['eip155']?.events).toEqual(['accountsChanged', 'chainChanged'])
      expect(result['eip155']?.chains).toEqual(['eip155:1'])
      expect(result['eip155']?.rpcMap).toEqual({ '1': 'https://ethereum.rpc.com' })
    })

    test('applies chain overrides for existing namespace', () => {
      const baseNamespaces = {
        eip155: {
          methods: ['eth_sign', 'personal_sign'],
          events: ['accountsChanged', 'chainChanged'],
          chains: ['eip155:1'],
          rpcMap: { '1': 'https://ethereum.rpc.com' }
        }
      }

      const result = WcHelpersUtil.applyNamespaceOverrides(baseNamespaces, {
        chains: { eip155: ['eip155:42', 'eip155:56'] }
      })

      expect(result['eip155']?.chains).toEqual(['eip155:42', 'eip155:56'])
      // Other properties should remain unchanged
      expect(result['eip155']?.methods).toEqual(['eth_sign', 'personal_sign'])
      expect(result['eip155']?.events).toEqual(['accountsChanged', 'chainChanged'])
      expect(result['eip155']?.rpcMap).toEqual({ '1': 'https://ethereum.rpc.com' })
    })

    test('applies event overrides for existing namespace', () => {
      const baseNamespaces = {
        eip155: {
          methods: ['eth_sign', 'personal_sign'],
          events: ['accountsChanged', 'chainChanged'],
          chains: ['eip155:1'],
          rpcMap: { '1': 'https://ethereum.rpc.com' }
        }
      }

      const result = WcHelpersUtil.applyNamespaceOverrides(baseNamespaces, {
        events: { eip155: ['newEvent1', 'newEvent2'] }
      })

      expect(result['eip155']?.events).toEqual(['newEvent1', 'newEvent2'])
      // Other properties should remain unchanged
      expect(result['eip155']?.methods).toEqual(['eth_sign', 'personal_sign'])
      expect(result['eip155']?.chains).toEqual(['eip155:1'])
      expect(result['eip155']?.rpcMap).toEqual({ '1': 'https://ethereum.rpc.com' })
    })

    test('handles multiple types of overrides simultaneously', () => {
      const baseNamespaces = {
        eip155: {
          methods: ['eth_sign', 'personal_sign'],
          events: ['accountsChanged', 'chainChanged'],
          chains: ['eip155:1'],
          rpcMap: { '1': 'https://ethereum.rpc.com' }
        }
      }

      const result = WcHelpersUtil.applyNamespaceOverrides(baseNamespaces, {
        methods: { eip155: ['method1', 'method2'] },
        chains: { eip155: ['eip155:42'] },
        events: { eip155: ['event1'] },
        rpcMap: { 'eip155:42': 'https://kovan.rpc.com' }
      })

      expect(result).toEqual({
        eip155: {
          methods: ['method1', 'method2'],
          events: ['event1'],
          chains: ['eip155:42'],
          rpcMap: {
            '42': 'https://kovan.rpc.com'
          }
        }
      })
    })
  })

  describe('isOriginAllowed', () => {
    const defaultOrigins = [
      'https://default.com',
      'https://*.safe.org',
      'https://reown.com/appkit',
      'https://demo.reown.com'
    ]
    const allowedPatterns = [
      'https://explicit.com',
      'http://localhost:*',
      'https://sub.*.example.net'
    ]

    test('should allow exact match from allowedPatterns', () => {
      expect(
        WcHelpersUtil.isOriginAllowed('https://explicit.com', allowedPatterns, defaultOrigins)
      ).toBe(true)
    })

    test('should allow exact match from defaultOrigins with full URL', () => {
      expect(
        WcHelpersUtil.isOriginAllowed('https://reown.com', allowedPatterns, defaultOrigins)
      ).toBe(true)
    })

    test('should allow exact match from defaultOrigins with sub domain', () => {
      expect(
        WcHelpersUtil.isOriginAllowed('https://demo.reown.com', allowedPatterns, defaultOrigins)
      ).toBe(true)
    })

    test('should allow exact match from defaultAllowedOrigins', () => {
      expect(
        WcHelpersUtil.isOriginAllowed('https://default.com', allowedPatterns, defaultOrigins)
      ).toBe(true)
    })

    test('should allow wildcard match from allowedPatterns (port)', () => {
      expect(
        WcHelpersUtil.isOriginAllowed('http://localhost:3000', allowedPatterns, defaultOrigins)
      ).toBe(true)
      expect(
        WcHelpersUtil.isOriginAllowed('http://localhost:8080', allowedPatterns, defaultOrigins)
      ).toBe(true)
    })

    test('should allow wildcard match from defaultAllowedOrigins (subdomain)', () => {
      expect(
        WcHelpersUtil.isOriginAllowed('https://app.safe.org', allowedPatterns, defaultOrigins)
      ).toBe(true)
      expect(
        WcHelpersUtil.isOriginAllowed('https://api.safe.org', allowedPatterns, defaultOrigins)
      ).toBe(true)
    })

    test('should allow wildcard match from allowedPatterns (middle)', () => {
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://sub.domain.example.net',
          allowedPatterns,
          defaultOrigins
        )
      ).toBe(true)
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://sub.another-domain.example.net',
          allowedPatterns,
          defaultOrigins
        )
      ).toBe(true)
    })

    test('should deny non-matching origin', () => {
      expect(
        WcHelpersUtil.isOriginAllowed('https://unknown.com', allowedPatterns, defaultOrigins)
      ).toBe(false)
    })

    test('should deny partial match without wildcard', () => {
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://explicit.com.hacker',
          allowedPatterns,
          defaultOrigins
        )
      ).toBe(false)
      expect(
        WcHelpersUtil.isOriginAllowed('http://safe.org', allowedPatterns, defaultOrigins) // Protocol mismatch
      ).toBe(false)
    })

    test('should deny if allowed lists are empty', () => {
      expect(WcHelpersUtil.isOriginAllowed('https://any.com', [], [])).toBe(false)
    })

    test('should handle origins and patterns with dots correctly', () => {
      const patternsWithDots = ['https://test.example.com']
      const defaultWithDots = ['https://*.another.test.org']
      expect(
        WcHelpersUtil.isOriginAllowed('https://test.example.com', patternsWithDots, defaultWithDots)
      ).toBe(true) // Exact match
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://sub.another.test.org',
          patternsWithDots,
          defaultWithDots
        )
      ).toBe(true) // Wildcard match
      expect(
        WcHelpersUtil.isOriginAllowed('https://test-example.com', patternsWithDots, defaultWithDots)
      ).toBe(false) // Dot treated literally
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://sub.another-test.org',
          patternsWithDots,
          defaultWithDots
        )
      ).toBe(false) // Dot treated literally in wildcard part
    })

    test('should be case-sensitive', () => {
      expect(
        WcHelpersUtil.isOriginAllowed('HTTPS://EXPLICIT.COM', allowedPatterns, defaultOrigins)
      ).toBe(false)
      expect(
        WcHelpersUtil.isOriginAllowed('https://app.SAFE.org', allowedPatterns, defaultOrigins)
      ).toBe(false)
    })

    test('should allow 127.0.0.1 IP address with HTTP', () => {
      expect(
        WcHelpersUtil.isOriginAllowed(
          'http://127.0.0.1:3000',
          [],
          WcConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
      expect(
        WcHelpersUtil.isOriginAllowed(
          'http://127.0.0.1:8080',
          [],
          WcConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
    })

    test('should allow 127.0.0.1 IP address with HTTPS', () => {
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://127.0.0.1:3000',
          [],
          WcConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://127.0.0.1:8443',
          [],
          WcConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
    })

    test('should allow localhost with HTTPS', () => {
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://localhost:3000',
          [],
          WcConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://localhost:8443',
          [],
          WcConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
    })
  })
})
