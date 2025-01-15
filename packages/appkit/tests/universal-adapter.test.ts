import type UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'

import { WalletConnectConnector } from '../src/connectors'
import { UniversalAdapter } from '../src/universal-adapter/client'

// Mock provider
const mockProvider = {
  on: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  setDefaultChain: vi.fn(),
  client: {
    core: {
      crypto: {
        getClientId: vi.fn(() => Promise.resolve('client-id'))
      }
    }
  }
} as unknown as UniversalProvider

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

    adapter.connectors.push(
      vi.mocked(
        new WalletConnectConnector({
          provider: mockProvider,
          caipNetworks: [mockCaipNetwork],
          namespace: 'eip155'
        })
      )
    )

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
