import { describe, test, expect } from 'vitest'
import { WcHelpersUtil } from '../../utils/HelpersUtil'
import type { CaipNetwork } from '@reown/appkit-common'
import type { SessionTypes } from '@walletconnect/types'

const mockEthereumNetwork = {
  id: 'eip155:1',
  chainNamespace: 'eip155',
  chainId: '1',
  name: 'Ethereum',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
  currency: 'ETH'
} as const

const mockPolygonNetwork = {
  id: 'eip155:137',
  chainNamespace: 'eip155',
  chainId: '137',
  name: 'Polygon',
  explorerUrl: 'https://polygonscan.com',
  rpcUrl: 'https://polygon.rpc.com',
  currency: 'MATIC'
} as const

const mockSolanaNetwork = {
  id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  chainNamespace: 'solana',
  chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  explorerUrl: 'https://explorer.solana.com',
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  currency: 'SOL'
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
        mockSolanaNetwork
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
          chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
          rpcMap: {
            '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'https://api.mainnet-beta.solana.com'
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
})
