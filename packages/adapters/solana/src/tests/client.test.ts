import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  type ConnectionControllerClient,
  ConnectorController,
  type Provider as CoreProvider,
  ProviderController,
  WcHelpersUtil
} from '@reown/appkit-controllers'
import { CaipNetworksUtil, HelpersUtil, PresetsUtil } from '@reown/appkit-utils'
import { solana } from '@reown/appkit/networks'

import { SolanaAdapter } from '../client'
import { AuthProvider } from '../providers/AuthProvider'
import { SolanaWalletConnectProvider } from '../providers/SolanaWalletConnectProvider'
import type { WalletStandardProvider } from '../providers/WalletStandardProvider'
import { SolStoreUtil } from '../utils/SolanaStoreUtil'
import { watchStandard } from '../utils/watchStandard'
import { mockAuthConnector } from './mocks/AuthConnector'
import { mockCoinbaseWallet } from './mocks/CoinbaseWallet'
import { mockUniversalProvider } from './mocks/UniversalProvider'

// Mock external dependencies
vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn(endpoint => ({
    getBalance: vi.fn().mockResolvedValue(1500000000),
    getSignatureStatus: vi.fn().mockResolvedValue({ value: true }),
    rpcEndpoint: endpoint
  })),
  PublicKey: vi.fn(key => ({ toBase58: () => key }))
}))

vi.mock('../utils/watchStandard', () => ({
  watchStandard: vi.fn()
}))

const mockProvider = {
  connect: vi.fn().mockResolvedValue('mock-address'),
  disconnect: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  signMessage: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  sendTransaction: vi.fn().mockResolvedValue('mock-signature')
} as unknown as WalletStandardProvider

const mockNetworks = [solana]
const mockCaipNetworks = CaipNetworksUtil.extendCaipNetworks(mockNetworks, {
  projectId: 'test-project-id',
  customNetworkImageUrls: {}
})

const mockWalletConnectConnector = vi.mocked(
  new SolanaWalletConnectProvider({
    provider: mockUniversalProvider(),
    chains: mockCaipNetworks,
    getActiveChain: () => mockCaipNetworks[0]
  })
)

describe('SolanaAdapter', () => {
  let adapter: SolanaAdapter
  vi.spyOn(SolStoreUtil, 'setConnection')
  vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue(mockNetworks)

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new SolanaAdapter()
    adapter.construct({
      networks: mockNetworks,
      projectId: 'test-project-id',
      namespace: ConstantsUtil.CHAIN.SOLANA,
      adapterType: ConstantsUtil.ADAPTER_TYPES.SOLANA
    })
    ChainController.initialize([adapter], mockCaipNetworks, {
      connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient
    })
    ChainController.setRequestedCaipNetworks(mockCaipNetworks, 'solana')
  })

  describe('SolanaAdapter - syncConnectors', () => {
    it('should not add coinbase connector if window.coinbaseSolana does not exist', async () => {
      const addConnectorSpy = vi.spyOn(adapter, 'addConnector' as any)
      adapter.syncConnectors()
      expect(addConnectorSpy).not.toHaveBeenCalled()
    })

    it('should add coinbase connector if window.coinbaseSolana exist', async () => {
      ;(window as any).coinbaseSolana = mockCoinbaseWallet()
      const addConnectorSpy = vi.spyOn(adapter, 'addConnector' as any)
      adapter.syncConnectors()
      expect(addConnectorSpy).toHaveBeenCalledOnce()
      expect(addConnectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.CONNECTOR_ID.COINBASE_SDK],
          type: 'ANNOUNCED',
          name: 'Coinbase Wallet',
          chain: 'solana',
          requestedChains: [solana]
        })
      )
    })
  })

  describe('SolanaAdapter - constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(adapter.namespace).toBe(ConstantsUtil.CHAIN.SOLANA)
      expect(adapter.adapterType).toBe(ConstantsUtil.ADAPTER_TYPES.SOLANA)
      expect(adapter.networks).toEqual(mockNetworks)
      expect(adapter.projectId).toBe('test-project-id')
      expect(SolStoreUtil.setConnection).toHaveBeenCalledWith(
        expect.objectContaining({ rpcEndpoint: solana.rpcUrls.default.http[0] })
      )
    })
  })

  describe('SolanaAdapter - connect', () => {
    beforeEach(() => {
      const connectors = [
        {
          id: 'test',
          provider: mockProvider,
          type: 'EXTERNAL',
          connect: vi.fn().mockResolvedValue('mock-address'),
          on: vi.fn()
        }
      ]
      Object.defineProperty(adapter, 'connectors', {
        value: connectors
      })
    })

    it('should connect with external provider', async () => {
      const result = await adapter.connect({
        id: 'test',
        provider: mockProvider,
        type: 'EXTERNAL',
        chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        rpcUrl: 'mock_rpc_url'
      })

      expect(result.address).toBe('mock-address')
      expect(result.chainId).toBe('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')
      expect(SolStoreUtil.setConnection).toHaveBeenCalledWith(
        expect.objectContaining({ rpcEndpoint: 'mock_rpc_url' })
      )
    })

    it('should fallback for network rpc url if param is not provider', async () => {
      await adapter.connect({
        id: 'test',
        provider: mockProvider,
        type: 'EXTERNAL',
        chainId: solana.id
      })

      expect(SolStoreUtil.setConnection).toHaveBeenCalledWith(
        expect.objectContaining({ rpcEndpoint: solana.rpcUrls.default.http[0] })
      )
    })

    it('should throw if not possible to get a rpc url', async () => {
      await expect(
        adapter.connect({
          id: 'test',
          provider: mockProvider,
          type: 'EXTERNAL',
          chainId: 'mock_chain_id'
        })
      ).rejects.toThrowError('RPC URL not found for chainId: mock_chain_id')
    })
  })

  describe('SolanaAdapter - disconnect', () => {
    it('should disconnect provider', async () => {
      const adapter = new SolanaAdapter()

      Object.defineProperty(adapter, 'connectors', {
        value: [
          {
            id: 'test',
            provider: mockProvider,
            type: 'EXTERNAL'
          }
        ]
      })

      await adapter.disconnect({
        id: 'test'
      })

      expect(mockProvider.disconnect).toHaveBeenCalled()
    })

    it('should disconnect all connectors if no connector id provided and return them as connections', async () => {
      const connector1 = {
        id: 'test1',
        provider: {
          connect: vi.fn().mockResolvedValue('mock-address-1'),
          disconnect: vi.fn(),
          on: vi.fn(),
          removeListener: vi.fn(),
          signMessage: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
          sendTransaction: vi.fn().mockResolvedValue('mock-signature-1')
        } as unknown as WalletStandardProvider,
        type: 'EXTERNAL'
      }

      const connector2 = {
        id: 'test2',
        provider: {
          connect: vi.fn().mockResolvedValue('mock-address-2'),
          disconnect: vi.fn(),
          on: vi.fn(),
          removeListener: vi.fn(),
          signMessage: vi.fn().mockResolvedValue(new Uint8Array([4, 5, 6])),
          sendTransaction: vi.fn().mockResolvedValue('mock-signature-2')
        } as unknown as WalletStandardProvider,
        type: 'EXTERNAL'
      }

      const solanaAdapter = new SolanaAdapter()

      Object.defineProperty(solanaAdapter, 'connectors', {
        value: [connector1, connector2]
      })

      // Add connections
      ;(solanaAdapter as any).addConnection({
        connectorId: connector1.id,
        accounts: [{ address: 'address1' }],
        caipNetwork: mockCaipNetworks[0]
      })
      ;(solanaAdapter as any).addConnection({
        connectorId: connector2.id,
        accounts: [{ address: 'address2' }],
        caipNetwork: mockCaipNetworks[0]
      })

      const result = await solanaAdapter.disconnect({ id: undefined })

      expect(connector1.provider.disconnect).toHaveBeenCalled()
      expect(connector2.provider.disconnect).toHaveBeenCalled()
      expect(result.connections).toHaveLength(2)

      const connectorIds = result.connections.map(c => c.connectorId)
      expect(connectorIds).toContain(connector1.id)
      expect(connectorIds).toContain(connector2.id)
    })

    it('should handle empty connections', async () => {
      const solanaAdapter = new SolanaAdapter()

      Object.defineProperty(solanaAdapter, 'connectors', {
        value: []
      })

      const result = await solanaAdapter.disconnect({ id: undefined })

      expect(result.connections).toHaveLength(0)
    })

    it('should throw error if one of the connector is not found from connections', async () => {
      const solanaAdapter = new SolanaAdapter()

      Object.defineProperty(solanaAdapter, 'connectors', {
        value: []
      })

      // Add connection with non-existent connector
      ;(solanaAdapter as any).addConnection({
        connectorId: 'non-existent-connector',
        accounts: [{ address: 'address1' }],
        caipNetwork: mockCaipNetworks[0]
      })

      await expect(solanaAdapter.disconnect({ id: undefined })).rejects.toThrow(
        'Connector not found'
      )
    })

    it('should throw error if one of the connector fails to disconnect', async () => {
      const connector = {
        id: 'test',
        provider: {
          connect: vi.fn().mockResolvedValue('mock-address'),
          disconnect: vi.fn().mockRejectedValue(new Error('Disconnect failed')),
          on: vi.fn(),
          removeListener: vi.fn(),
          signMessage: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
          sendTransaction: vi.fn().mockResolvedValue('mock-signature')
        } as unknown as WalletStandardProvider,
        type: 'EXTERNAL'
      }

      const solanaAdapter = new SolanaAdapter()

      Object.defineProperty(solanaAdapter, 'connectors', {
        value: [connector]
      })

      // Add connection
      ;(solanaAdapter as any).addConnection({
        connectorId: connector.id,
        accounts: [{ address: 'address1' }],
        caipNetwork: mockCaipNetworks[0]
      })

      await expect(solanaAdapter.disconnect({ id: undefined })).rejects.toThrow('Disconnect failed')
      expect(connector.provider.disconnect).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - syncConnections', () => {
    let mockEmitFirstAvailableConnection: any

    beforeEach(() => {
      mockEmitFirstAvailableConnection = vi
        .spyOn(adapter as any, 'emitFirstAvailableConnection')
        .mockImplementation(() => {})
    })

    it('should sync connections for connectors that have connected and are not disconnected', async () => {
      const mockConnector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: mockProvider,
        connect: vi.fn().mockResolvedValue('mock-address')
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [mockConnector]
      })

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValueOnce({
        hasDisconnected: false,
        hasConnected: true
      })

      const listenSolanaProviderEventsSpy = vi
        .spyOn(adapter as any, 'listenSolanaProviderEvents')
        .mockImplementation(() => {})

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: mockCaipNetworks[0]
      })

      expect(mockConnector.connect).toHaveBeenCalledWith({
        chainId: mockCaipNetworks[0].id
      })
      expect(listenSolanaProviderEventsSpy).toHaveBeenCalledWith(
        mockConnector.id,
        mockConnector.provider
      )
      expect(adapter.connections).toHaveLength(1)
      expect(adapter.connections[0]?.connectorId).toBe(mockConnector.id)
    })

    it('should skip connectors that are disconnected', async () => {
      const mockConnector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: mockProvider,
        connect: vi.fn().mockResolvedValue('mock-address')
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [mockConnector]
      })

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValueOnce({
        hasDisconnected: true,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: mockCaipNetworks[0]
      })

      expect(mockConnector.connect).not.toHaveBeenCalled()
      expect(adapter.connections).toHaveLength(0)
    })

    it('should handle WalletConnect connector specially', async () => {
      const mockWcProvider = mockWalletConnectConnector
      await adapter.setUniversalProvider(mockWcProvider.provider)

      const wcConnector = adapter.connectors.find(c => c.id === 'walletConnect')
      expect(wcConnector).toBeDefined()

      vi.spyOn(WcHelpersUtil, 'getWalletConnectAccounts').mockReturnValue([
        {
          address: '0xwcaddress',
          chainId: 1,
          chainNamespace: 'eip155' as any
        }
      ])

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValueOnce({
        hasDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false
      })

      const wcConnection = adapter.connections.find(c => c.connectorId === 'walletConnect')
      expect(WcHelpersUtil.getWalletConnectAccounts).toHaveBeenCalledWith(
        mockWcProvider.provider,
        'solana'
      )
      expect(wcConnection).toBeDefined()
    })

    it('should call emitFirstAvailableConnection when connectToFirstConnector is true', async () => {
      const mockConnector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: mockProvider,
        connect: vi.fn().mockResolvedValue('mock-address')
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [mockConnector]
      })

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValueOnce({
        hasDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: true,
        caipNetwork: mockCaipNetworks[0]
      })

      expect(mockEmitFirstAvailableConnection).toHaveBeenCalled()
    })

    it('should not call emitFirstAvailableConnection when connectToFirstConnector is false', async () => {
      const mockConnector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: mockProvider,
        connect: vi.fn().mockResolvedValue('mock-address')
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [mockConnector]
      })

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValueOnce({
        hasDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: mockCaipNetworks[0]
      })

      expect(mockEmitFirstAvailableConnection).not.toHaveBeenCalled()
    })

    it('should handle connector connection failures', async () => {
      const mockConnector1 = {
        id: 'test1',
        type: 'EXTERNAL',
        provider: mockProvider,
        connect: vi.fn().mockRejectedValue(new Error('Connection failed'))
      }

      const mockConnector2 = {
        id: 'test2',
        type: 'EXTERNAL',
        provider: mockProvider,
        connect: vi.fn().mockResolvedValue('mock-address-2')
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [mockConnector1, mockConnector2]
      })

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      await expect(
        adapter.syncConnections({
          connectToFirstConnector: false,
          caipNetwork: mockCaipNetworks[0]
        })
      ).rejects.toThrow('Connection failed')

      expect(adapter.connections).toHaveLength(1)
      expect(adapter.connections[0]?.connectorId).toBe(mockConnector2.id)

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockRestore()
    })

    it('should not add connection if no address returned from connector', async () => {
      const mockConnector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: mockProvider,
        connect: vi.fn().mockResolvedValue(undefined)
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [mockConnector]
      })

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValueOnce({
        hasDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: mockCaipNetworks[0]
      })

      expect(adapter.connections).toHaveLength(0)
    })

    it('should not listen to provider events for WalletConnect connectors', async () => {
      const wcConnector = {
        id: 'walletConnect',
        type: 'WALLET_CONNECT',
        provider: mockWalletConnectConnector.provider,
        connect: vi.fn().mockResolvedValue('wc-address')
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [wcConnector]
      })

      vi.spyOn(HelpersUtil, 'getConnectorStorageInfo').mockReturnValueOnce({
        hasDisconnected: false,
        hasConnected: true
      })

      const listenProviderEventsSpy = vi
        .spyOn(adapter as any, 'listenProviderEvents')
        .mockImplementation(() => {})

      await adapter.syncConnections({
        connectToFirstConnector: false,
        caipNetwork: mockCaipNetworks[0]
      })

      expect(listenProviderEventsSpy).not.toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - getBalance', () => {
    it('should get balance successfully', async () => {
      const result = await adapter.getBalance({
        address: 'mock-address',
        chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        caipNetwork: mockCaipNetworks[0]
      })

      expect(result).toEqual({
        balance: '1.5',
        symbol: 'SOL'
      })
    })
    it('should get balance successfully mult', async () => {
      const numSimultaneousRequests = 10
      const expectedSentRequests = 1
      vi.mock('@solana/web3.js', () => ({
        Connection: vi.fn(endpoint => ({
          getBalance: vi.fn().mockResolvedValue(
            new Promise(resolve => {
              setTimeout(() => resolve(1500000000), 1000)
            })
          ),
          getSignatureStatus: vi.fn().mockResolvedValue({ value: true }),
          rpcEndpoint: endpoint
        })),
        PublicKey: vi.fn(key => ({ toBase58: () => key }))
      }))

      const result = await Promise.all([
        ...Array.from({ length: numSimultaneousRequests }).map(() =>
          adapter.getBalance({
            address: 'mock-address',
            chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
            caipNetwork: mockCaipNetworks[0]
          })
        )
      ])

      expect(result.length).toBe(numSimultaneousRequests)
      expect(expectedSentRequests).to.be.lt(numSimultaneousRequests)

      // verify all calls got the same balance
      for (const balance of result) {
        expect(balance).toEqual({
          balance: '1.5',
          symbol: 'SOL'
        })
      }
    })
  })

  describe('SolanaAdapter - signMessage', () => {
    it('should sign message successfully', async () => {
      const result = await adapter.signMessage({
        message: 'Hello',
        address: 'mock-address',
        provider: mockProvider as unknown as CoreProvider
      })

      expect(result.signature).toBeDefined()
      expect(mockProvider.signMessage).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - switchNetwork', () => {
    it('should switch network with auth provider', async () => {
      const switchNetworkSpy = vi.fn()
      const provider = Object.assign(Object.create(AuthProvider.prototype), {
        type: 'AUTH',
        switchNetwork: switchNetworkSpy,
        getUser: mockAuthConnector.connect,
        syncDappData: vi.fn(),
        syncTheme: vi.fn()
      })

      // Set up provider in ProviderController for super.switchNetwork() call
      ProviderController.setProvider(mockCaipNetworks[0].chainNamespace, provider)
      ProviderController.setProviderId(mockCaipNetworks[0].chainNamespace, 'AUTH')

      // Mock ConnectorController.getAuthConnector to return our mock provider
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
        provider
      } as any)

      await adapter.switchNetwork({
        caipNetwork: mockCaipNetworks[0]
      })

      expect(switchNetworkSpy).toHaveBeenCalled()
      expect(SolStoreUtil.setConnection).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - connectWalletConnect', () => {
    it('should connect WalletConnect provider', async () => {
      vi.mocked(adapter['connectors']).push(mockWalletConnectConnector)
      await adapter.connectWalletConnect()

      expect(mockWalletConnectConnector.provider.connect).toHaveBeenCalled()
      expect(SolStoreUtil.setConnection).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - getWalletConnectProvider', () => {
    it('should return WalletConnect provider', () => {
      const result = adapter.getWalletConnectProvider({
        provider: mockUniversalProvider(),
        caipNetworks: mockCaipNetworks,
        activeCaipNetwork: mockCaipNetworks[0]
      })

      expect(result).toBeDefined()
    })
  })

  describe('SolanaAdapter - syncConnectors', () => {
    it.each(['Phantom', 'Trust Wallet', 'Solflare', 'unknown wallet'])(
      'should parse watchStandard ids from cloud',
      walletName => {
        const watchStandardSpy = vi.mocked(watchStandard)
        const addProviderSpy = vi.spyOn(adapter as any, 'addConnector')
        adapter.syncConnectors()

        const callback = watchStandardSpy.mock.calls[0]![2]
        callback({ name: walletName } as any)

        expect(watchStandard).toHaveBeenCalled()
        expect(addProviderSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            name: walletName
          })
        )
      }
    )
  })
})
