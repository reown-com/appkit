import UniversalProvider from '@walletconnect/universal-provider'
import { providers } from 'ethers'
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import { WcHelpersUtil } from '@reown/appkit'
import {
  type CaipAddress,
  ConstantsUtil as CommonConstantsUtil,
  Emitter
} from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  type ConnectionControllerClient,
  type NetworkControllerClient,
  type Provider,
  SIWXUtil
} from '@reown/appkit-controllers'
import { ConnectorUtil } from '@reown/appkit-scaffold-ui/utils'
import { CaipNetworksUtil } from '@reown/appkit-utils'
import { ProviderUtil } from '@reown/appkit-utils'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { mainnet, polygon } from '@reown/appkit/networks'

import { Ethers5Adapter } from '../client'
import { Ethers5Methods } from '../utils/Ethers5Methods'

// Mock external dependencies
vi.mock('ethers', async importOriginal => {
  const actual = await importOriginal<typeof import('ethers')>()
  return {
    ...actual,
    formatEther: vi.fn(() => '1.5'),
    providers: {
      JsonRpcProvider: vi.fn(() => ({
        getBalance: vi.fn()
      })),
      Web3Provider: vi.fn(() => ({
        on: vi.fn((event, callback) => {
          if (event === 'pending') {
            callback()
          }
        })
      }))
    }
  }
})

const mockProvider = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn()
} as unknown as Provider

const mockWalletConnectProvider = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  session: true,
  setDefaultChain: vi.fn()
} as unknown as UniversalProvider

const mockAuthProvider = {
  connect: vi.fn().mockResolvedValue({ address: '0x123' }),
  disconnect: vi.fn(),
  switchNetwork: vi.fn(),
  getUser: vi.fn()
} as unknown as W3mFrameProvider

const mockNetworks = [mainnet, polygon]
const mockCaipNetworks = CaipNetworksUtil.extendCaipNetworks(mockNetworks, {
  projectId: 'test-project-id',
  customNetworkImageUrls: {}
})

describe('Ethers5Adapter', () => {
  let adapter: Ethers5Adapter

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new Ethers5Adapter()
    ChainController.initialize([adapter], mockCaipNetworks, {
      connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient,
      networkControllerClient: vi.fn() as unknown as NetworkControllerClient
    })
    ChainController.setRequestedCaipNetworks(mockCaipNetworks, 'eip155')
  })

  describe('Ethers5Adapter -constructor', () => {
    it('should set adapterType', () => {
      expect(adapter.adapterType).toEqual(CommonConstantsUtil.ADAPTER_TYPES.ETHERS5)
    })

    it('should set namespace', () => {
      expect(adapter.namespace).toEqual(CommonConstantsUtil.CHAIN.EVM)
    })

    it('should not set info property for injected connector', () => {
      const mockConnectors = [
        {
          id: 'Browser Wallet',
          name: 'Browser Wallet',
          type: 'injected',
          info: { rdns: 'Browser Wallet' }
        }
      ]

      ;(adapter as any).syncConnectors(mockConnectors)

      const injectedConnector = mockConnectors.filter((c: any) => c.id === 'injected')[0]

      expect(injectedConnector?.info).toBeUndefined()
    })
  })

  describe('Ethers5Adapter - signMessage', () => {
    it('should sign message successfully', async () => {
      const mockSignature = '0xmocksignature'

      vi.spyOn(mockProvider, 'request').mockResolvedValue(mockSignature)

      const result = await adapter.signMessage({
        message: 'Hello',
        address: '0x123',
        provider: mockProvider
      })

      expect(result.signature).toBe(mockSignature)
    })

    it('should throw error when provider is undefined', async () => {
      await expect(
        adapter.signMessage({
          message: 'Hello',
          address: '0x123'
        })
      ).rejects.toThrow('Provider is undefined')
    })
  })

  describe('Ethers5Adapter -sendTransaction', () => {
    it('should send transaction successfully', async () => {
      const mockTxHash = '0xtxhash'
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        caipAddress: 'eip155:1:0x123'
      })
      vi.spyOn(Ethers5Methods, 'sendTransaction').mockResolvedValue(mockTxHash)

      const result = await adapter.sendTransaction({
        value: BigInt(1000),
        to: '0x456',
        data: '0x',
        gas: BigInt(21000),
        gasPrice: BigInt(2000000000),
        provider: mockProvider,
        caipNetwork: mockCaipNetworks[0]
      })

      expect(result.hash).toBe(mockTxHash)
    })

    it('should throw error when provider is undefined', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        caipAddress: 'eip155:1:0x123'
      })
      await expect(
        adapter.sendTransaction({
          value: BigInt(1000),
          to: '0x456',
          data: '0x',
          gas: BigInt(21000),
          gasPrice: BigInt(2000000000)
        })
      ).rejects.toThrow('Provider is undefined')
    })
  })

  describe('Ethers5Adapter -writeContract', () => {
    it('should write contract successfully', async () => {
      const mockTxHash = '0xtxhash'
      vi.spyOn(Ethers5Methods, 'writeContract').mockResolvedValue(mockTxHash)

      const result = await adapter.writeContract({
        abi: [],
        method: 'transfer',
        caipAddress: 'eip155:1:0x123',
        fromAddress: '0x123',
        args: ['0x789', BigInt(1000)],
        tokenAddress: '0x789',
        provider: mockProvider,
        caipNetwork: mockCaipNetworks[0],
        chainNamespace: 'eip155'
      })

      expect(result.hash).toBe(mockTxHash)
    })
  })

  describe('Ethers5Adapter -connect', () => {
    it('should connect with external provider', async () => {
      vi.mocked(mockProvider.request).mockImplementation(request => {
        if (request.method === 'eth_requestAccounts') return Promise.resolve(['0x123'])
        if (request.method === 'eth_chainId') return Promise.resolve('0x1')
        if (request.method === 'wallet_switchEthereumChain') return Promise.resolve(null)
        return Promise.resolve(null)
      })
      const connectors = [
        {
          id: 'test',
          provider: mockProvider,
          chains: [1],
          type: 'EXTERNAL',
          chain: 1
        }
      ]
      Object.defineProperty(adapter, 'connectors', {
        value: connectors
      })

      const result = await adapter.connect({
        id: 'test',
        provider: mockProvider,
        type: 'EXTERNAL',
        chainId: 1
      })

      expect(result.address).toBe('0x123')
      expect(result.chainId).toBe(1)
    })

    it('should call switch network if wallet chain id is different than requested chain id', async () => {
      vi.mocked(mockProvider.request).mockImplementation(request => {
        if (request.method === 'eth_requestAccounts') return Promise.resolve(['0x123'])
        if (request.method === 'eth_chainId') return Promise.resolve('137') // Return a different chain id
        if (request.method === 'wallet_switchEthereumChain') return Promise.resolve(null)
        return Promise.resolve(null)
      })

      const connectors = [
        {
          id: 'test',
          provider: mockProvider,
          chains: [1],
          type: 'EXTERNAL',
          chain: 1
        }
      ]

      Object.defineProperty(adapter, 'connectors', {
        value: connectors
      })

      const result = await adapter.connect({
        id: 'test',
        provider: mockProvider,
        type: 'EXTERNAL',
        chainId: 1
      })

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }]
      })

      expect(result.address).toBe('0x123')
      expect(result.chainId).toBe(1)
    })

    it('should respect preferredAccountType when calling connect with AUTH provider', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        preferredAccountType: 'smartAccount'
      })

      const ethers5Adapter = new Ethers5Adapter()

      const connect = vi.fn().mockResolvedValue({ address: '0x123' })

      const mockAuthProviderWithConnect = {
        ...mockAuthProvider,
        connect
      } as unknown as W3mFrameProvider

      Object.defineProperty(ethers5Adapter, 'connectors', {
        value: [
          {
            id: 'test',
            provider: mockAuthProviderWithConnect,
            chains: [1],
            type: 'AUTH',
            chain: 1
          }
        ]
      })

      await ethers5Adapter.connect({
        id: 'test',
        type: 'AUTH',
        chainId: 1
      })

      expect(connect).toHaveBeenCalledWith({
        chainId: 1,
        preferredAccountType: 'smartAccount'
      })
    })
  })

  describe('Ethers5Adapter -disconnect', () => {
    it('should disconnect WalletConnect provider', async () => {
      const ethers5Adapter = new Ethers5Adapter()

      Object.defineProperty(ethers5Adapter, 'connectors', {
        value: [
          {
            id: 'walletConnect',
            provider: mockWalletConnectProvider,
            type: 'WALLET_CONNECT'
          }
        ]
      })

      await ethers5Adapter.disconnect({
        id: 'walletConnect'
      })

      expect(mockWalletConnectProvider.disconnect).toHaveBeenCalled()
    })

    it('should disconnect Auth provider', async () => {
      const ethers5Adapter = new Ethers5Adapter()

      Object.defineProperty(ethers5Adapter, 'connectors', {
        value: [
          {
            id: 'ID_AUTH',
            provider: mockAuthProvider,
            type: 'AUTH'
          }
        ]
      })

      await ethers5Adapter.disconnect({
        id: 'ID_AUTH'
      })

      expect(mockAuthProvider.disconnect).toHaveBeenCalled()
    })

    it('should disconnect all connectors if no connector id provided and return them as connections', async () => {
      const connector1 = {
        id: 'test1',
        type: 'EXTERNAL',
        provider: {
          request: vi.fn(),
          on: vi.fn(),
          removeListener: vi.fn()
        } as unknown as Provider
      }

      const connector2 = {
        id: 'test2',
        type: 'EXTERNAL',
        provider: {
          request: vi.fn(),
          on: vi.fn(),
          removeListener: vi.fn()
        } as unknown as Provider
      }

      const ethers5Adapter = new Ethers5Adapter()

      Object.defineProperty(ethers5Adapter, 'connectors', {
        value: [connector1, connector2]
      })
      ;(ethers5Adapter as any).addConnection({
        connectorId: connector1.id,
        accounts: [{ address: '0xaddress1' }],
        caipNetwork: mockCaipNetworks[0]
      })
      ;(ethers5Adapter as any).addConnection({
        connectorId: connector2.id,
        accounts: [{ address: '0xaddress2' }],
        caipNetwork: mockCaipNetworks[0]
      })

      const revokePermissionsSpy = vi
        .spyOn(ethers5Adapter as any, 'revokeProviderPermissions')
        .mockResolvedValue(undefined)

      const result = await ethers5Adapter.disconnect({ id: undefined })

      expect(revokePermissionsSpy).toHaveBeenCalledTimes(2)
      expect(result.connections).toHaveLength(2)

      const connectorIds = result.connections.map(c => c.connectorId)
      expect(connectorIds).toContain(connector1.id)
      expect(connectorIds).toContain(connector2.id)
    })

    it('should handle empty connections', async () => {
      const ethers5Adapter = new Ethers5Adapter()

      Object.defineProperty(ethers5Adapter, 'connectors', {
        value: []
      })

      const result = await ethers5Adapter.disconnect({ id: undefined })

      expect(result.connections).toHaveLength(0)
    })

    it('should throw error if one of the connector is not found from connections', async () => {
      const ethers5Adapter = new Ethers5Adapter()

      Object.defineProperty(ethers5Adapter, 'connectors', {
        value: []
      })
      ;(ethers5Adapter as any).addConnection({
        connectorId: 'non-existent-connector',
        accounts: [{ address: '0xaddress1' }],
        caipNetwork: mockCaipNetworks[0]
      })

      await expect(ethers5Adapter.disconnect({ id: undefined })).rejects.toThrow(
        'Connector not found'
      )
    })

    it('should throw error if one of the connector fails to disconnect', async () => {
      const connector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: {
          request: vi.fn(),
          on: vi.fn(),
          removeListener: vi.fn()
        } as unknown as Provider
      }

      const ethers5Adapter = new Ethers5Adapter()

      Object.defineProperty(ethers5Adapter, 'connectors', {
        value: [connector]
      })
      ;(ethers5Adapter as any).addConnection({
        connectorId: connector.id,
        accounts: [{ address: '0xaddress1' }],
        caipNetwork: mockCaipNetworks[0]
      })

      const revokePermissionsSpy = vi
        .spyOn(ethers5Adapter as any, 'revokeProviderPermissions')
        .mockRejectedValue(new Error('Disconnect failed'))

      await expect(ethers5Adapter.disconnect({ id: undefined })).rejects.toThrow(
        'Disconnect failed'
      )
      expect(revokePermissionsSpy).toHaveBeenCalled()
    })
  })

  describe('Ethers5Adapter -reconnect', () => {
    it('should call SIWXUtil.authConnectorAuthenticate when reconnecting with AUTH provider', async () => {
      const ethers5Adapter = new Ethers5Adapter()
      const authConnectorAuthenticateSpy = vi.spyOn(SIWXUtil, 'authConnectorAuthenticate')

      Object.defineProperty(ethers5Adapter, 'connectors', {
        value: [
          {
            id: 'ID_AUTH',
            type: 'AUTH',
            provider: mockAuthProvider
          }
        ]
      })

      await ethers5Adapter.reconnect({
        id: 'ID_AUTH',
        type: 'AUTH',
        chainId: 1
      })

      expect(authConnectorAuthenticateSpy).toHaveBeenCalledWith({
        authConnector: mockAuthProvider,
        chainId: 1,
        preferredAccountType: 'smartAccount',
        chainNamespace: 'eip155'
      })
    })
  })

  describe('Ethers5Adapter -syncConnections', () => {
    let mockGetConnectorStorageInfo: Mock
    let mockEmitFirstAvailableConnection: any

    beforeEach(() => {
      mockGetConnectorStorageInfo = vi.fn()
      mockEmitFirstAvailableConnection = vi
        .spyOn(adapter as any, 'emitFirstAvailableConnection')
        .mockImplementation(() => {})
    })

    it('should sync connections for connectors that have connected and are not disconnected', async () => {
      const connector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: {
          request: vi.fn(),
          on: vi.fn(),
          removeListener: vi.fn()
        } as unknown as Provider
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [connector]
      })

      mockGetConnectorStorageInfo.mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      const fetchProviderDataSpy = vi.spyOn(ConnectorUtil, 'fetchProviderData').mockResolvedValue({
        accounts: ['0x123'],
        chainId: 1
      })

      const listenProviderEventsSpy = vi
        .spyOn(adapter as any, 'listenProviderEvents')
        .mockImplementation(() => {})

      await adapter.syncConnections({
        connectToFirstConnector: false,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(fetchProviderDataSpy).toHaveBeenCalledWith(connector)
      expect(listenProviderEventsSpy).toHaveBeenCalledWith(connector.id, connector.provider)
      expect(adapter.connections).toHaveLength(1)
      expect(adapter.connections[0]?.connectorId).toBe(connector.id)
    })

    it('should skip connectors that are disconnected', async () => {
      const connector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: mockProvider
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [connector]
      })

      mockGetConnectorStorageInfo.mockReturnValue({
        hasDisconnected: true,
        hasConnected: true
      })

      const fetchProviderDataSpy = vi.spyOn(ConnectorUtil, 'fetchProviderData')

      await adapter.syncConnections({
        connectToFirstConnector: false,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(fetchProviderDataSpy).not.toHaveBeenCalled()
      expect(adapter.connections).toHaveLength(0)
    })

    it('should handle WalletConnect connector specially', async () => {
      const mockWcProvider = mockWalletConnectProvider
      adapter.setUniversalProvider(mockWcProvider)

      const wcConnector = adapter.connectors.find(c => c.id === 'walletConnect')
      expect(wcConnector).toBeDefined()

      vi.spyOn(WcHelpersUtil, 'getWalletConnectAccounts').mockReturnValue([
        {
          address: '0xwcaddress',
          chainId: 1,
          chainNamespace: 'eip155' as any
        }
      ])

      mockGetConnectorStorageInfo.mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      const wcConnection = adapter.connections.find(c => c.connectorId === 'walletConnect')
      expect(WcHelpersUtil.getWalletConnectAccounts).toHaveBeenCalledWith(mockWcProvider, 'eip155')
      expect(wcConnection).toBeDefined()
    })

    it('should call emitFirstAvailableConnection when connectToFirstConnector is true', async () => {
      const connector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: mockProvider
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [connector]
      })

      mockGetConnectorStorageInfo.mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      vi.spyOn(ConnectorUtil, 'fetchProviderData').mockResolvedValue({
        accounts: ['0x123'],
        chainId: 1
      })

      await adapter.syncConnections({
        connectToFirstConnector: true,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(mockEmitFirstAvailableConnection).toHaveBeenCalled()
    })

    it('should not call emitFirstAvailableConnection when connectToFirstConnector is false', async () => {
      const connector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: mockProvider
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [connector]
      })

      mockGetConnectorStorageInfo.mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      vi.spyOn(ConnectorUtil, 'fetchProviderData').mockResolvedValue({
        accounts: ['0x123'],
        chainId: 1
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(mockEmitFirstAvailableConnection).not.toHaveBeenCalled()
    })

    it('should handle connector connection failures', async () => {
      const connector1 = {
        id: 'test1',
        type: 'EXTERNAL',
        provider: mockProvider
      }
      const connector2 = {
        id: 'test2',
        type: 'EXTERNAL',
        provider: mockProvider
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [connector1, connector2]
      })

      mockGetConnectorStorageInfo.mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      vi.spyOn(ConnectorUtil, 'fetchProviderData')
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({
          accounts: ['0x123'],
          chainId: 1
        })

      await expect(
        adapter.syncConnections({
          connectToFirstConnector: false,
          getConnectorStorageInfo: mockGetConnectorStorageInfo
        })
      ).rejects.toThrow('Connection failed')

      expect(adapter.connections).toHaveLength(1)
      expect(adapter.connections[0]?.connectorId).toBe(connector2.id)
    })

    it('should not add connection if no accounts returned', async () => {
      const connector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: mockProvider
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [connector]
      })

      mockGetConnectorStorageInfo.mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      vi.spyOn(ConnectorUtil, 'fetchProviderData').mockResolvedValue({
        accounts: [],
        chainId: 1
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(adapter.connections).toHaveLength(0)
    })

    it('should not add connection if no chainId returned', async () => {
      const connector = {
        id: 'test',
        type: 'EXTERNAL',
        provider: mockProvider
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [connector]
      })

      mockGetConnectorStorageInfo.mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      vi.spyOn(ConnectorUtil, 'fetchProviderData').mockResolvedValue({
        accounts: ['0x123'],
        chainId: undefined
      })

      await adapter.syncConnections({
        connectToFirstConnector: false,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(adapter.connections).toHaveLength(0)
    })

    it('should not listen to provider events for AUTH and WALLET_CONNECT connectors', async () => {
      const authConnector = {
        id: 'ID_AUTH',
        type: 'AUTH',
        provider: mockAuthProvider
      }
      const wcConnector = {
        id: 'walletConnect',
        type: 'WALLET_CONNECT',
        provider: mockWalletConnectProvider
      }

      Object.defineProperty(adapter, 'connectors', {
        value: [authConnector, wcConnector]
      })

      mockGetConnectorStorageInfo.mockReturnValue({
        hasDisconnected: false,
        hasConnected: true
      })

      vi.spyOn(ConnectorUtil, 'fetchProviderData').mockResolvedValue({
        accounts: ['0x123'],
        chainId: 1
      })

      const listenProviderEventsSpy = vi
        .spyOn(adapter as any, 'listenProviderEvents')
        .mockImplementation(() => {})

      await adapter.syncConnections({
        connectToFirstConnector: false,
        getConnectorStorageInfo: mockGetConnectorStorageInfo
      })

      expect(listenProviderEventsSpy).not.toHaveBeenCalled()
    })
  })

  describe('Ethers5Adapter -getBalance', () => {
    it('should get balance successfully', async () => {
      const mockBalance = BigInt(1500000000000000000)
      vi.mocked(providers.JsonRpcProvider).mockImplementation(
        () =>
          ({
            getBalance: vi.fn().mockResolvedValue(mockBalance)
          }) as any
      )

      const result = await adapter.getBalance({
        address: '0x123',
        chainId: 1
      })

      expect(result).toEqual({
        balance: '1.5',
        symbol: 'ETH'
      })
    })
  })

  it('should set balance to zero if balance call fails', async () => {
    vi.mocked(providers.JsonRpcProvider).mockImplementation(
      () =>
        ({
          getBalance: vi.fn().mockRejectedValue(new Error('Failed to get balance'))
        }) as any
    )

    const result = await adapter.getBalance({
      address: '0x123',
      chainId: 1
    })

    expect(result).toEqual({
      balance: '0.00',
      symbol: 'ETH'
    })
  })

  it('should call getBalance once even when multiple adapter requests are sent at the same time', async () => {
    const mockBalance = BigInt(1500000000000000000)
    // delay the response to simulate http request latency
    const latency = 1000
    const numSimultaneousRequests = 10
    const expectedSentRequests = 1
    let mockedImplementationCalls = 0
    vi.mocked(providers.JsonRpcProvider).mockImplementation(
      () =>
        ({
          getBalance: vi.fn().mockResolvedValue(
            new Promise(resolve => {
              mockedImplementationCalls++
              setTimeout(() => resolve(mockBalance), latency)
            })
          )
        }) as any
    )

    const result = await Promise.all([
      ...Array.from({ length: numSimultaneousRequests }).map(() =>
        adapter.getBalance({
          address: '0x123',
          chainId: 1
        })
      )
    ])

    expect(mockedImplementationCalls).to.eql(expectedSentRequests)
    expect(result.length).toBe(numSimultaneousRequests)
    expect(expectedSentRequests).to.be.lt(numSimultaneousRequests)

    // verify all calls got the same balance
    for (const balance of result) {
      expect(balance).toEqual({
        balance: '1.5',
        symbol: 'ETH'
      })
    }
  })

  describe('Ethers5Adapter - switchNetwork', () => {
    it('should switch network with Auth provider', async () => {
      await adapter.switchNetwork({
        caipNetwork: mockCaipNetworks[0],
        provider: mockAuthProvider,
        providerType: 'AUTH'
      })

      expect(mockAuthProvider.switchNetwork).toHaveBeenCalledWith({ chainId: 'eip155:1' })
      expect(mockAuthProvider.getUser).toHaveBeenCalledWith({
        chainId: 'eip155:1',
        preferredAccountType: 'smartAccount'
      })
    })

    it('should call setDefaultChain and request from provider for WALLET_CONNECT', async () => {
      const adapter = new Ethers5Adapter()

      const mockProvider = {
        request: vi.fn(),
        setDefaultChain: vi.fn()
      } as unknown as UniversalProvider

      const params = {
        caipNetwork: {
          id: 1,
          caipNetworkId: 'eip155:1'
        },
        provider: mockProvider,
        providerType: 'WALLET_CONNECT'
      } as unknown as any

      await adapter.switchNetwork(params)

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }]
      })
    })
  })

  describe('Ethers5Adapter -getWalletConnectProvider', () => {
    it('should return WalletConnect provider', () => {
      Object.defineProperty(adapter, 'availableConnectors', {
        value: [
          {
            id: 'walletconnect',
            type: 'WALLET_CONNECT',
            provider: mockWalletConnectProvider,
            chain: 'eip155',
            chains: []
          }
        ]
      })

      const result = adapter.getWalletConnectProvider()
      expect(result).toBe(mockWalletConnectProvider)
    })
  })

  describe('Ethers5Adapter -parseUnits and formatUnits', () => {
    it('should parse units correctly', () => {
      expect(
        adapter.parseUnits({
          value: '1.5',
          decimals: 18
        })
      ).toBe(BigInt('1500000000000000000'))

      expect(
        adapter.parseUnits({
          value: '1.5',
          decimals: 6
        })
      ).toBe(BigInt('1500000'))
    })

    it('should format units correctly', () => {
      expect(
        adapter.formatUnits({
          value: BigInt('1500000000000000000'),
          decimals: 18
        })
      ).toBe('1.5')

      expect(
        adapter.formatUnits({
          value: BigInt('1500000'),
          decimals: 6
        })
      ).toBe('1.5')
    })
  })

  describe('Ethers5Adapter - Permissions', () => {
    const mockProvider = {
      request: vi.fn()
    } as unknown as UniversalProvider

    beforeEach(() => {
      vi.spyOn(ProviderUtil, 'getProvider').mockImplementation(() => mockProvider)
    })

    it('should call wallet_getCapabilities', async () => {
      await adapter.getCapabilities('eip155:1:0x123')

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_getCapabilities',
        params: ['eip155:1:0x123']
      })
    })

    it('should call wallet_grantPermissions', async () => {
      const mockParams = {
        pci: 'test-pci',
        expiry: 1234567890,
        address: '0x123',
        permissions: ['eth_accounts']
      }

      await adapter.grantPermissions(mockParams)

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_grantPermissions',
        params: mockParams
      })
    })

    it('should call wallet_revokePermissions', async () => {
      vi.mocked(mockProvider.request).mockImplementation(() => Promise.resolve('0x123'))

      const mockParams = {
        pci: 'test-pci',
        expiry: 1234567890,
        address: 'eip155:1:0x123' as CaipAddress,
        permissions: ['eth_accounts']
      }

      const result = await adapter.revokePermissions(mockParams)

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_revokePermissions',
        params: [mockParams]
      })
      expect(result).toBe('0x123')
    })
  })

  describe('EthersAdapter - provider listener', () => {
    it('should disconnect if accountsChanged event emits no accounts', async () => {
      const emitter = new Emitter()

      const mockProvider = {
        connect: vi.fn(),
        request: vi.fn().mockResolvedValue(['0x123']),
        removeListener: vi.fn(),
        on: emitter.on.bind(emitter),
        off: emitter.off.bind(emitter),
        emit: emitter.emit.bind(emitter)
      } as unknown as Provider

      Object.defineProperty(adapter, 'connectors', {
        value: [{ id: 'test', provider: mockProvider }]
      })

      await adapter.connect({
        id: 'test',
        type: 'EXTERNAL',
        chainId: 1
      })

      const disconnect = vi.fn()

      adapter.on('disconnect', disconnect)

      mockProvider.emit('accountsChanged', [])

      expect(disconnect).toHaveBeenCalled()
      expect(mockProvider.removeListener).toHaveBeenCalledWith('disconnect', expect.any(Function))
    })
  })
})
