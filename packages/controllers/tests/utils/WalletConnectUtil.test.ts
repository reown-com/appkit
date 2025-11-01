import type { SessionTypes } from '@walletconnect/types'
import { describe, expect, test, vi } from 'vitest'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

import { EnsController } from '../../src/controllers/EnsController.js'
import { WcHelpersUtil } from '../../src/utils/WalletConnectUtil.js'

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

    test('should allow if allowed lists are empty (spec: empty allowlist allows all)', () => {
      expect(WcHelpersUtil.isOriginAllowed('https://any.com', [], [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('http://any.com', [], [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('https://sub.any.com', [], [])).toBe(true)
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

    // Spec-specific coverage
    test('wildcard should only match a single label (spec: https://*.example.com)', () => {
      const patterns = ['https://*.example.com']
      expect(WcHelpersUtil.isOriginAllowed('https://www.example.com', patterns, [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('https://example.com', patterns, [])).toBe(false)
      expect(WcHelpersUtil.isOriginAllowed('https://www.subdomain.example.com', patterns, [])).toBe(
        false
      )
    })

    test('multi-label wildcards (spec: https://*.*.example.com)', () => {
      const patterns = ['https://*.*.example.com']
      expect(WcHelpersUtil.isOriginAllowed('https://www.subdomain.example.com', patterns, [])).toBe(
        true
      )
      expect(WcHelpersUtil.isOriginAllowed('https://www.example.com', patterns, [])).toBe(false)
      expect(WcHelpersUtil.isOriginAllowed('https://example.com', patterns, [])).toBe(false)
    })

    test('partial-label wildcards are invalid (spec: https://www-*.example.com)', () => {
      const patterns = ['https://www-*.example.com']
      expect(WcHelpersUtil.isOriginAllowed('https://www-sub.example.com', patterns, [])).toBe(false)
      expect(WcHelpersUtil.isOriginAllowed('https://www.example.com', patterns, [])).toBe(false)
    })

    test('schemeless patterns allow http and https (spec: example.com)', () => {
      const patterns = ['example.com']
      expect(WcHelpersUtil.isOriginAllowed('https://example.com', patterns, [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('http://example.com', patterns, [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('https://www.example.com', patterns, [])).toBe(false)
      expect(WcHelpersUtil.isOriginAllowed('http://www.example.com', patterns, [])).toBe(false)
    })

    test('scheme-specific patterns must match exactly (spec: https://example.com)', () => {
      const patterns = ['https://example.com']
      expect(WcHelpersUtil.isOriginAllowed('https://example.com', patterns, [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('http://example.com', patterns, [])).toBe(false)
    })

    test('port-specific patterns must match exactly (spec: https://example.com:8080)', () => {
      const patterns = ['https://example.com:8080']
      expect(WcHelpersUtil.isOriginAllowed('https://example.com:8080', patterns, [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('https://example.com', patterns, [])).toBe(false)
      expect(WcHelpersUtil.isOriginAllowed('https://example.com:8443', patterns, [])).toBe(false)
    })

    test('localhost and 127.0.0.1 are always permitted regardless of allowlists', () => {
      expect(WcHelpersUtil.isOriginAllowed('http://localhost:3000', [], [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('https://localhost:8443', [], [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('http://127.0.0.1:3000', [], [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('https://127.0.0.1:8443', [], [])).toBe(true)
      // No explicit port
      expect(WcHelpersUtil.isOriginAllowed('http://localhost', [], [])).toBe(true)
      expect(WcHelpersUtil.isOriginAllowed('http://127.0.0.1', [], [])).toBe(true)
    })

    test('should allow 127.0.0.1 IP address with HTTP', () => {
      expect(
        WcHelpersUtil.isOriginAllowed(
          'http://127.0.0.1:3000',
          [],
          ConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
      expect(
        WcHelpersUtil.isOriginAllowed(
          'http://127.0.0.1:8080',
          [],
          ConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
    })

    test('should allow 127.0.0.1 IP address with HTTPS', () => {
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://127.0.0.1:3000',
          [],
          ConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://127.0.0.1:8443',
          [],
          ConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
    })

    test('should allow localhost with HTTPS', () => {
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://localhost:3000',
          [],
          ConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
      expect(
        WcHelpersUtil.isOriginAllowed(
          'https://localhost:8443',
          [],
          ConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
        )
      ).toBe(true)
    })
  })

  describe('isUserRejectedRequestError', () => {
    test('returns true when error.code is USER_REJECTED (5000)', () => {
      const error = { code: WcHelpersUtil.RPC_ERROR_CODE.USER_REJECTED }
      expect(WcHelpersUtil.isUserRejectedRequestError(error)).toBe(true)
    })

    test('returns true when error.code is USER_REJECTED_METHODS (5002)', () => {
      const error = { code: WcHelpersUtil.RPC_ERROR_CODE.USER_REJECTED_METHODS }
      expect(WcHelpersUtil.isUserRejectedRequestError(error)).toBe(true)
    })

    test('returns false for other numeric codes', () => {
      const error = { code: 1234 }
      expect(WcHelpersUtil.isUserRejectedRequestError(error)).toBe(false)
    })

    test('returns false when code is a string number', () => {
      const error = { code: '5000' }
      expect(WcHelpersUtil.isUserRejectedRequestError(error)).toBe(false)
    })

    test('returns false when code is missing', () => {
      const error = { message: 'Some error' }
      expect(WcHelpersUtil.isUserRejectedRequestError(error)).toBe(false)
    })

    test('returns false for null/undefined/non-object inputs', () => {
      expect(WcHelpersUtil.isUserRejectedRequestError(null)).toBe(false)
      expect(WcHelpersUtil.isUserRejectedRequestError(undefined)).toBe(false)
      expect(WcHelpersUtil.isUserRejectedRequestError('string')).toBe(false)
      expect(WcHelpersUtil.isUserRejectedRequestError(5000)).toBe(false)
      expect(WcHelpersUtil.isUserRejectedRequestError(true)).toBe(false)
      expect(WcHelpersUtil.isUserRejectedRequestError(BigInt(0))).toBe(false)
      expect(WcHelpersUtil.isUserRejectedRequestError(new Error('test'))).toBe(false)
    })
  })

  describe('resolveReownName', () => {
    test('returns first resolved address when available', async () => {
      vi.spyOn(EnsController, 'resolveName').mockResolvedValue({
        addresses: {
          eip155: { address: '0xabc' },
          solana: { address: 'SoLAddRess' }
        }
      } as any)

      await expect(WcHelpersUtil.resolveReownName('alice.reown')).resolves.toBe('0xabc')
    })

    test('returns false when no address is found', async () => {
      vi.spyOn(EnsController, 'resolveName').mockResolvedValue({ addresses: {} } as any)
      await expect(WcHelpersUtil.resolveReownName('bob.reown')).resolves.toBe(false)

      vi.spyOn(EnsController, 'resolveName').mockResolvedValue(undefined as any)
      await expect(WcHelpersUtil.resolveReownName('charlie.reown')).resolves.toBe(false)
    })
  })

  describe('getWalletConnectAccounts', () => {
    test('returns parsed unique accounts for namespace', () => {
      const provider: any = {
        session: {
          namespaces: {
            eip155: {
              accounts: [
                'eip155:1:0xABCDEF0000000000000000000000000000000001',
                'eip155:137:0xabcdef0000000000000000000000000000000001', // duplicate address, different chain, different case
                'eip155:1:0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
              ]
            }
          }
        }
      }

      const result = WcHelpersUtil.getWalletConnectAccounts(provider, 'eip155')
      expect(result).toEqual([
        {
          address: '0xABCDEF0000000000000000000000000000000001',
          chainId: '1',
          chainNamespace: 'eip155'
        },
        {
          address: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          chainId: '1',
          chainNamespace: 'eip155'
        }
      ])
    })

    test('returns empty array when no accounts found', () => {
      const provider: any = { session: { namespaces: { eip155: { accounts: [] } } } }
      expect(WcHelpersUtil.getWalletConnectAccounts(provider, 'eip155')).toEqual([])
    })
  })

  describe('listenWcProvider', () => {
    function createMockProvider() {
      const handlers: Record<string, Function[]> = {}
      return {
        on(event: string, handler: Function) {
          handlers[event] = handlers[event] || []
          handlers[event].push(handler)
        },
        emit(event: string, ...args: any[]) {
          ;(handlers[event] || []).forEach(fn => fn(...args))
        },
        // minimal shapes used by listeners
        session: { namespaces: { eip155: { accounts: ['eip155:1:0x111'] } } },
        rpcProviders: { eip155: { getDefaultChain: () => '1' } }
      } as any
    }

    test('wires connect/disconnect/chainChanged/display_uri events', () => {
      const provider = createMockProvider()
      const onConnect = vi.fn()
      const onDisconnect = vi.fn()
      const onChainChanged = vi.fn()
      const onDisplayUri = vi.fn()

      const spyAccounts = vi
        .spyOn(WcHelpersUtil, 'getWalletConnectAccounts')
        .mockReturnValue([{ address: '0x1', chainId: '1', chainNamespace: 'eip155' } as any])

      WcHelpersUtil.listenWcProvider({
        universalProvider: provider,
        namespace: 'eip155',
        onConnect,
        onDisconnect,
        onChainChanged,
        onDisplayUri
      })

      provider.emit('connect')
      expect(onConnect).toHaveBeenCalledWith([
        { address: '0x1', chainId: '1', chainNamespace: 'eip155' }
      ])
      spyAccounts.mockRestore()

      provider.emit('disconnect')
      expect(onDisconnect).toHaveBeenCalled()

      provider.emit('chainChanged', 1)
      expect(onChainChanged).toHaveBeenCalledWith(1)

      provider.emit('display_uri', 'wc:abc')
      expect(onDisplayUri).toHaveBeenCalledWith('wc:abc')
    })

    test('accountsChanged emits only when parsed accounts exist', () => {
      const provider = createMockProvider()
      const onAccountsChanged = vi.fn()

      WcHelpersUtil.listenWcProvider({
        universalProvider: provider,
        namespace: 'eip155',
        onAccountsChanged
      })

      // matching account present
      provider.emit('accountsChanged', ['0x111'])
      expect(onAccountsChanged).toHaveBeenCalledWith([
        { address: '0x111', chainId: '1', chainNamespace: 'eip155' }
      ])

      // non-matching should not emit
      onAccountsChanged.mockClear()
      provider.emit('accountsChanged', ['0x222'])
      expect(onAccountsChanged).not.toHaveBeenCalled()
    })
  })
})
