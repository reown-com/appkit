import type UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { WalletConnectConnector } from '@reown/appkit-controllers'

import { UniversalAdapter } from '../src/universal-adapter/client'

// Mock provider
const mockProvider = {
  on: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  setDefaultChain: vi.fn(),
  request: vi.fn().mockImplementation(() => Promise.resolve()),
  client: {
    core: {
      crypto: {
        getClientId: vi.fn(() => Promise.resolve('client-id'))
      }
    }
  }
} as unknown as UniversalProvider & { request: ReturnType<typeof vi.fn> }

// Mock CaipNetwork
const mockCaipNetwork: CaipNetwork = {
  id: 1,
  name: 'Ethereum',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1',
  rpcUrls: {
    default: { http: ['https://ethereum.rpc.com'] }
  },
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  }
}

describe('UniversalAdapter', () => {
  let adapter: UniversalAdapter

  beforeEach(() => {
    vi.clearAllMocks()

    adapter = new UniversalAdapter()

    const connector = new WalletConnectConnector({
      provider: mockProvider,
      caipNetworks: [mockCaipNetwork],
      namespace: 'eip155'
    })

    adapter.connectors.push(vi.mocked(connector))

    // Set the provider directly on the adapter
    Object.defineProperty(adapter, 'provider', {
      value: mockProvider,
      writable: true
    })

    Object.defineProperty(adapter, 'caipNetworks', {
      value: [mockCaipNetwork],
      writable: true
    })
  })

  describe('connectWalletConnect', () => {
    it('should connect successfully', async () => {
      await adapter.connectWalletConnect()

      expect(mockProvider.connect).toHaveBeenCalledWith({
        optionalNamespaces: expect.any(Object)
      })
    })

    it('should throw error if provider is undefined', async () => {
      Object.defineProperty(adapter, 'connectors', {
        value: [],
        writable: true
      })

      await expect(adapter.connectWalletConnect()).rejects.toThrow(
        'WalletConnectConnector not found'
      )
    })

    it('should call onUri when display_uri event is emitted', async () => {
      const testUri = 'wc:test-uri'

      // Call the callback directly when 'on' is called
      vi.mocked(mockProvider.on).mockImplementation((event: string, callback: any) => {
        if (event === 'display_uri') {
          callback(testUri)
        }
        return mockProvider
      })

      await adapter.connectWalletConnect()
    })
  })

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      await adapter.disconnect()

      expect(mockProvider.disconnect).toHaveBeenCalled()
    })

    it('should handle missing provider gracefully', async () => {
      Object.defineProperty(adapter, 'connectors', {
        value: [],
        writable: true
      })

      await expect(adapter.disconnect()).resolves.not.toThrow()
    })
  })

  describe('switchNetwork', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      Object.defineProperty(adapter, 'provider', {
        value: mockProvider,
        writable: true
      })
    })

    it('should switch network successfully', async () => {
      const polygonNetwork: CaipNetwork = {
        ...mockCaipNetwork,
        caipNetworkId: 'eip155:137',
        id: 137,
        name: 'Polygon',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        }
      }

      await adapter.switchNetwork({ caipNetwork: polygonNetwork })

      expect(mockProvider.setDefaultChain).toHaveBeenCalledWith('eip155:137')
    })

    it('should not call wallet_switchEthereumChain for non-eip155 chains', async () => {
      const solanaNetwork: CaipNetwork = {
        ...mockCaipNetwork,
        chainNamespace: 'solana',
        caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        id: 101,
        name: 'Solana'
      }

      await adapter.switchNetwork({ caipNetwork: solanaNetwork })

      expect(mockProvider.request).not.toHaveBeenCalled()
      expect(mockProvider.setDefaultChain).toHaveBeenCalledWith(solanaNetwork.caipNetworkId)
    })

    it('should call wallet_addEthereumChain when switch fails with unrecognized chain', async () => {
      const arbitrumNetwork: CaipNetwork = {
        ...mockCaipNetwork,
        caipNetworkId: 'eip155:42161',
        id: 42161,
        name: 'Arbitrum One',
        rpcUrls: {
          chainDefault: { http: ['https://arb1.arbitrum.io/rpc'] },
          default: {
            http: [],
            webSocket: undefined
          }
        },
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        blockExplorers: {
          default: {
            url: 'https://arbiscan.io',
            name: 'Arbitrum One'
          }
        }
      }

      mockProvider.request
        .mockRejectedValueOnce({ code: 4902 }) // Unrecognized chain error
        .mockResolvedValueOnce({})

      await adapter.switchNetwork({ caipNetwork: arbitrumNetwork })

      expect(mockProvider.request).toHaveBeenCalledTimes(2)
      expect(mockProvider.request).toHaveBeenNthCalledWith(1, {
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xa4b1' }]
      })
      expect(mockProvider.request).toHaveBeenNthCalledWith(2, {
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0xa4b1',
            rpcUrls: [['https://arb1.arbitrum.io/rpc']],
            chainName: 'Arbitrum One',
            nativeCurrency: {
              name: 'Ether',
              decimals: 18,
              symbol: 'ETH'
            },
            blockExplorerUrls: ['https://arbiscan.io']
          }
        ]
      })
      expect(mockProvider.setDefaultChain).toHaveBeenCalledWith('eip155:42161')
    })

    it('should successfully switch chain without needing to add it', async () => {
      const mainnetNetwork: CaipNetwork = {
        ...mockCaipNetwork,
        caipNetworkId: 'eip155:1',
        id: 1,
        name: 'Ethereum'
      }

      mockProvider.request.mockResolvedValueOnce({})

      await adapter.switchNetwork({ caipNetwork: mainnetNetwork })

      expect(mockProvider.request).toHaveBeenCalledTimes(1)
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }]
      })
      expect(mockProvider.setDefaultChain).toHaveBeenCalledWith('eip155:1')
    })

    it('should throw error if provider is undefined', async () => {
      Object.defineProperty(adapter, 'connectors', {
        value: [],
        writable: true
      })

      await expect(
        adapter.switchNetwork({
          caipNetwork: mockCaipNetwork
        })
      ).rejects.toThrow('WalletConnectConnector not found')
    })
  })

  describe('getAccounts', () => {
    it('should return empty array if there is no accounts', async () => {
      mockProvider.session = undefined
      const accounts = await adapter.getAccounts({ id: '', namespace: 'eip155' })

      expect(accounts).toEqual({ accounts: [] })
    })

    it('should return accounts successfully', async () => {
      mockProvider.session = {
        namespaces: {
          eip155: {
            accounts: ['eip155:mock_network:mock_address_1', 'eip155:mock_network:mock_address_2']
          }
        }
      } as any

      Object.assign(adapter, {
        provider: mockProvider
      })

      const accounts = await adapter.getAccounts({ id: '', namespace: 'eip155' })

      expect(accounts).toEqual({
        accounts: [
          {
            address: 'mock_address_1',
            namespace: 'eip155',
            path: undefined,
            publicKey: undefined,
            type: 'eoa'
          },
          {
            address: 'mock_address_2',
            namespace: 'eip155',
            path: undefined,
            publicKey: undefined,
            type: 'eoa'
          }
        ]
      })
    })
  })
})
