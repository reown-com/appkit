import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockAccount, mockAppKit, mockOptions, mockWagmiClient } from './mocks/adapter.mock'
import {
  arbitrum as AppkitArbitrum,
  mainnet as AppkitMainnet,
  polygon as AppkitPolygon,
  optimism as AppkitOptimism,
  bsc as AppkitBsc
} from '@reown/appkit/networks'
import { connect, disconnect, getAccount, getChainId, getEnsName, getBalance } from '@wagmi/core'
import { CaipNetworksUtil, ConstantsUtil } from '@reown/appkit-utils'
import type { CaipNetwork } from '@reown/appkit-common'
import { http } from 'viem'
import { WagmiAdapter } from '../client'

const [mainnet, arbitrum] = CaipNetworksUtil.extendCaipNetworks(
  [AppkitMainnet, AppkitArbitrum, AppkitPolygon, AppkitOptimism, AppkitBsc],
  { customNetworkImageUrls: {}, projectId: '1234' }
) as [CaipNetwork, CaipNetwork, CaipNetwork, CaipNetwork, CaipNetwork]

const mockOptionsExtended = {
  ...mockOptions,
  networks: mockAppKit.getCaipNetworks('eip155') as [CaipNetwork, ...CaipNetwork[]],
  defaultNetwork: mainnet
}

const mockConnector = mockWagmiClient.wagmiConfig.connectors[0]!

vi.mock('@wagmi/core', async () => {
  const actual = await vi.importActual('@wagmi/core')
  return {
    ...actual,
    getEnsName: vi.fn(),
    getBalance: vi.fn(),
    getEnsAvatar: vi.fn()
  }
})

describe('Wagmi Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(getEnsName as any).mockResolvedValue('mock.eth')
    ;(getBalance as any).mockResolvedValue({ formatted: '1.0', symbol: 'ETH' })
    vi.spyOn(mockAppKit, 'fetchIdentity').mockResolvedValue({ name: 'example.eth', avatar: '' })
    vi.spyOn(mockAppKit, 'getReownName').mockImplementation(() => Promise.resolve([]))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Wagmi Client - Initialization', () => {
    it('should initialize with default values', () => {
      expect(mockWagmiClient.chainNamespace).toBe('eip155')
      expect(mockWagmiClient.adapterType).toBe('wagmi')
    })

    it('should set caipNetworks to provided caipNetworks options', () => {
      /**
       * Specifically to Wagmi, we are mutating caipNetworks on both Wagmi constructor and when we set adapters.
       * So there is not proper way to compare objects since imageId and imageUrl is added later.
       */
      mockWagmiClient.caipNetworks.forEach((network, index) => {
        expect(network.name).toEqual(mockOptionsExtended.networks[index]?.name)
      })
    })

    it('should set chain images', () => {
      const client = new WagmiAdapter({
        projectId: '123',
        networks: [mainnet, arbitrum]
      })

      client.construct(mockAppKit, mockOptionsExtended)

      Object.entries(mockOptions.chainImages).map(([networkId, imageUrl]) => {
        const caipNetwork = client.caipNetworks.find(
          caipNetwork => caipNetwork.id === Number(networkId)
        )
        expect(caipNetwork).toBeDefined()
        expect(caipNetwork?.assets?.imageUrl).toEqual(imageUrl)
      })
    })

    it('should set defaultNetwork to first caipNetwork option', () => {
      /**
       * Specifically to Wagmi, we are mutating caipNetworks on both Wagmi constructor and when we set adapters.
       * So there is not proper way to compare objects since imageId and imageUrl is added later.
       */
      expect(mockWagmiClient.defaultCaipNetwork?.id).toEqual(mainnet.id)
      expect(mockWagmiClient.defaultCaipNetwork?.name).toEqual(mainnet.name)
    })

    it('should create wagmi config', () => {
      expect(mockWagmiClient['wagmiConfig']).toBeDefined()
    })
  })

  describe('Wagmi Client - Network', () => {
    it('should switch to correct chain', async () => {
      await mockWagmiClient.networkControllerClient?.switchCaipNetwork(arbitrum)

      expect(getChainId(mockWagmiClient.wagmiConfig)).toBe(arbitrum.id)
    })

    it('should sync the correct requested networks', async () => {
      const setRequestedCaipNetworks = vi.spyOn(mockAppKit, 'setRequestedCaipNetworks')

      mockWagmiClient['syncRequestedNetworks']([mainnet, arbitrum])

      /**
       * Specifically to Wagmi, we are mutating caipNetworks on both Wagmi constructor and when we set adapters.
       * So there is not proper way to compare objects since imageId and imageUrl is added later.
       */
      mockWagmiClient.caipNetworks.forEach(network => {
        expect(setRequestedCaipNetworks).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ id: network.id })]),
          'eip155'
        )
      })
    })
  })

  describe('Wagmi Client - Connection', () => {
    it('should connect and disconnect to client', async () => {
      expect(mockAppKit.getIsConnectedState()).toBe(false)
      expect(mockAppKit.getCaipAddress()).toBeUndefined()

      const setApprovedCaipNetworksData = vi
        .spyOn(mockAppKit, 'setApprovedCaipNetworksData')
        .mockResolvedValue()

      expect(mockWagmiClient.wagmiConfig).toBeDefined()

      const syncAccountSpy = vi.spyOn(mockWagmiClient as any, 'syncAccount')
      const mockConnectorConnectSpy = vi.spyOn(mockConnector, 'connect')
      const mockConnectorGetAccountsSpy = vi.spyOn(mockConnector, 'connect')

      await connect(mockWagmiClient.wagmiConfig, {
        connector: mockConnector
      })

      expect(syncAccountSpy).toHaveBeenCalledTimes(2)
      expect(mockConnectorConnectSpy).toHaveBeenCalledOnce()
      expect(mockConnectorGetAccountsSpy).toHaveBeenCalledOnce()
      expect(setApprovedCaipNetworksData).toHaveBeenCalledOnce()

      expect(mockAppKit.getCaipAddress()).toBe(
        `${ConstantsUtil.EIP155}:${mainnet.id}:${mockAccount.address}`
      )

      const connectedWagmiAccount = getAccount(mockWagmiClient.wagmiConfig)

      expect(connectedWagmiAccount.status).toBe('connected')
      expect(connectedWagmiAccount.address).toBe(mockAccount.address)

      const resetAccountSpy = vi.spyOn(mockAppKit, 'resetAccount')
      const resetWcSpy = vi.spyOn(mockAppKit, 'resetWcConnection')
      const resetNetworkSpy = vi.spyOn(mockAppKit, 'resetNetwork')
      const setAllAccountsSpy = vi.spyOn(mockAppKit, 'setAllAccounts')

      const mockConnectorDisconnectSpy = vi.spyOn(mockConnector, 'disconnect')

      await disconnect(mockWagmiClient.wagmiConfig)

      expect(mockConnectorConnectSpy).toHaveBeenCalled()
      expect(mockConnectorDisconnectSpy).toHaveBeenCalledOnce()

      const disconnectedWagmiAccount = getAccount(mockWagmiClient.wagmiConfig)

      expect(disconnectedWagmiAccount.status).toBe('disconnected')
      expect(disconnectedWagmiAccount.address).toBeUndefined()
      expect(resetAccountSpy).toHaveBeenCalledOnce()
      expect(resetWcSpy).toHaveBeenCalledOnce()
      expect(resetNetworkSpy).toHaveBeenCalledOnce()
      expect(setAllAccountsSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('Wagmi Client - Sync Account', () => {
    it('should sync account correctly when connected', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890'
      const mockChainId = 1
      const mockConnector = {
        id: 'mockConnector',
        name: 'Mock Connector',
        getProvider: vi.fn().mockResolvedValue({})
      }

      const setCaipAddressSpy = vi.spyOn(mockAppKit, 'setCaipAddress')

      const syncNetworkSpy = vi.spyOn(mockWagmiClient as any, 'syncNetwork')
      const syncProfileSpy = vi.spyOn(mockWagmiClient as any, 'syncProfile')
      const syncBalanceSpy = vi.spyOn(mockWagmiClient as any, 'syncBalance')
      const syncConnectedWalletInfoSpy = vi.spyOn(mockWagmiClient as any, 'syncConnectedWalletInfo')

      await (mockWagmiClient as any).syncAccount({
        address: mockAddress,
        chainId: mockChainId,
        connector: mockConnector,
        status: 'connected'
      })

      expect(setCaipAddressSpy).toHaveBeenCalledWith(
        `eip155:${mockChainId}:${mockAddress}`,
        'eip155'
      )

      expect(syncNetworkSpy).toHaveBeenCalledOnce()
      expect(syncNetworkSpy).toHaveBeenCalledWith(mockAddress, mockChainId, true)

      expect(syncProfileSpy).toHaveBeenCalledOnce()
      expect(syncProfileSpy).toHaveBeenCalledWith(mockAddress, mockChainId)

      expect(syncBalanceSpy).toHaveBeenCalledOnce()
      expect(syncBalanceSpy).toHaveBeenCalledWith(mockAddress, mockChainId)

      expect(syncConnectedWalletInfoSpy).toHaveBeenCalledOnce
      expect(syncConnectedWalletInfoSpy).toHaveBeenCalledWith(mockConnector)
    })
  })

  describe('Wagmi Client - Sync Network', () => {
    it('should sync network correctly', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890'

      mockWagmiClient.caipNetworks = [mainnet, arbitrum]

      const setCaipNetworkSpy = vi.spyOn(mockAppKit, 'setCaipNetwork')
      const setCaipAddressSpy = vi.spyOn(mockAppKit, 'setCaipAddress')
      const setAddressExplorerUrlSpy = vi.spyOn(mockAppKit, 'setAddressExplorerUrl')

      await (mockWagmiClient as any).syncNetwork(mockAddress, mainnet.id, true)

      expect(setCaipNetworkSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          caipNetworkId: 'eip155:1',
          name: 'Ethereum',
          chainNamespace: 'eip155'
        })
      )

      expect(setCaipAddressSpy).toHaveBeenCalledWith(
        `eip155:${mainnet.id}:${mockAddress}`,
        'eip155'
      )
      expect(setAddressExplorerUrlSpy).toHaveBeenCalledWith(
        'https://etherscan.io/address/0x1234567890123456789012345678901234567890',
        'eip155'
      )
    })

    it('should not sync network if chain is not found', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890'
      const mockChainId = 999

      mockWagmiClient.options = mockOptionsExtended
      const setCaipNetworkSpy = vi.spyOn(mockAppKit, 'setCaipNetwork')
      const syncBalanceSpy = vi.spyOn(mockWagmiClient as any, 'syncBalance')

      await (mockWagmiClient as any).syncNetwork(mockAddress, mockChainId, true)

      expect(setCaipNetworkSpy).not.toHaveBeenCalled()
      expect(syncBalanceSpy).not.toHaveBeenCalled()
    })
  })

  describe('Wagmi Client - Sync WalletConnect Name', () => {
    it('should sync WalletConnect name correctly', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890'
      const mockWcName = 'MockWallet'

      mockAppKit.getReownName = vi.fn().mockResolvedValue([{ name: mockWcName }])

      const setProfileNameSpy = vi.spyOn(mockAppKit, 'setProfileName')

      await (mockWagmiClient as any).syncReownName(mockAddress)

      expect(mockAppKit.getReownName).toHaveBeenCalledWith(mockAddress)

      expect(setProfileNameSpy).toHaveBeenCalledWith(mockWcName, 'eip155')
    })

    it('should set profile name to null if no WalletConnect name is found', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890'

      mockAppKit.getReownName = vi.fn().mockResolvedValue([])

      const setProfileNameSpy = vi.spyOn(mockAppKit, 'setProfileName')

      await (mockWagmiClient as any).syncReownName(mockAddress)

      expect(mockAppKit.getReownName).toHaveBeenCalledWith(mockAddress)

      expect(setProfileNameSpy).toHaveBeenCalledWith(null, 'eip155')
    })

    it('should handle errors and set profile name to null', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890'

      mockAppKit.getReownName = vi.fn().mockRejectedValue(new Error('Mock error'))

      const setProfileNameSpy = vi.spyOn(mockAppKit, 'setProfileName')

      await (mockWagmiClient as any).syncReownName(mockAddress)

      expect(mockAppKit.getReownName).toHaveBeenCalledWith(mockAddress)

      expect(setProfileNameSpy).toHaveBeenCalledWith(null, 'eip155')
    })
  })

  describe('Wagmi Client - Sync Balance', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890'
    const mockChainId = 1 // Ethereum mainnet

    beforeEach(() => {
      mockWagmiClient.options = { networks: [mainnet], projectId: '123' }
      mockAppKit.setBalance = vi.fn()
      ;(getBalance as any).mockReset()
    })

    it('should sync balance successfully', async () => {
      const mockBalance = { formatted: '1.5', symbol: 'ETH' }
      ;(getBalance as any).mockResolvedValue(mockBalance)

      await (mockWagmiClient as any).syncBalance(mockAddress, mockChainId)

      expect(getBalance).toHaveBeenCalledWith(mockWagmiClient.wagmiConfig, {
        address: mockAddress,
        chainId: mockChainId,
        token: undefined
      })
      expect(mockAppKit.setBalance).toHaveBeenCalledWith(
        mockBalance.formatted,
        mockBalance.symbol,
        'eip155'
      )
    })

    it('should not sync balance if chain is not found', async () => {
      await (mockWagmiClient as any).syncBalance(mockAddress, 999)

      expect(getBalance).not.toHaveBeenCalled()
      expect(mockAppKit.setBalance).toHaveBeenCalledWith(undefined, undefined, 'eip155')
    })
  })

  describe('Wagmi Client - syncConnectedWalletInfo', () => {
    it('should sync connected wallet info correctly', async () => {
      const setConnectedWalletInfoSpy = vi.spyOn(mockAppKit, 'setConnectedWalletInfo')
      const mockWalletConnectProvider = {
        session: {
          peer: {
            metadata: {
              name: 'WalletConnect Wallet',
              icons: ['wc-icon-url']
            }
          }
        }
      }

      const walletConnectConnector = {
        id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
        name: 'WalletConnect',
        getProvider: vi.fn().mockResolvedValue(mockWalletConnectProvider)
      }

      await (mockWagmiClient as any).syncConnectedWalletInfo(walletConnectConnector)

      expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(
        {
          name: 'WalletConnect Wallet',
          icon: 'wc-icon-url',
          icons: ['wc-icon-url']
        },
        'eip155'
      )
    })
  })

  describe('Wagmi Client - SyncConnectors', () => {
    beforeEach(() => {
      vi.resetAllMocks()
      mockWagmiClient.options = {
        ...mockOptions,
        connectorImages: {
          mockConnector: 'mock-connector-image-url'
        }
      }
      mockAppKit.setConnectors = vi.fn()
    })

    it('should sync connectors correctly', () => {
      const mockConnectors = [
        { id: 'mockConnector1', name: 'Mock Connector 1', type: 'injected' },
        { id: 'mockConnector2', name: 'Mock Connector 2', type: 'walletConnect' },
        { id: ConstantsUtil.AUTH_CONNECTOR_ID, name: 'Auth Connector', type: 'auth' } // This should be skipped
      ]

      ;(mockWagmiClient as any).syncConnectors(mockConnectors)

      expect(mockAppKit.setConnectors).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'mockConnector1',
            name: 'Mock Connector 1',
            type: 'INJECTED',
            chain: 'eip155'
          }),
          expect.objectContaining({
            id: 'mockConnector2',
            name: 'Mock Connector 2',
            type: 'WALLET_CONNECT',
            chain: 'eip155'
          })
        ])
      )
    })

    it('should use custom connector image if provided', () => {
      const mockConnectors = [{ id: 'mockConnector', name: 'Mock Connector', type: 'injected' }]

      ;(mockWagmiClient as any).syncConnectors(mockConnectors)

      expect(mockAppKit.setConnectors).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'mockConnector',
            imageUrl: 'mock-connector-image-url'
          })
        ])
      )
    })

    it('should handle duplicate connectors', () => {
      const mockConnectors = [
        { id: 'mockConnector', name: 'Mock Connector 1', type: 'injected' },
        { id: 'mockConnector', name: 'Mock Connector 2', type: 'walletConnect' }
      ]

      ;(mockWagmiClient as any).syncConnectors(mockConnectors)

      const setConnectorsCalls = (mockAppKit.setConnectors as any).mock.calls
      const syncedConnectors = setConnectorsCalls[0][0]
      const mockConnectorCount = syncedConnectors.filter(
        (c: any) => c.id === 'mockConnector'
      ).length

      expect(mockConnectorCount).toBe(1)
    })
  })

  describe('Wagmi Client - Sync Auth Connector', () => {
    beforeEach(() => {
      mockAppKit.addConnector = vi.fn()
      ;(mockWagmiClient as any).initAuthConnectorListeners = vi.fn()
    })

    it('should sync auth connector correctly', async () => {
      const mockAuthConnector = {
        id: ConstantsUtil.AUTH_CONNECTOR_ID,
        name: 'Auth Connector',
        type: 'auth',
        getProvider: vi.fn().mockResolvedValue('mockProvider')
      }

      await (mockWagmiClient as any).syncAuthConnector(mockAuthConnector)

      expect(mockAppKit.addConnector).toHaveBeenCalledWith({
        id: ConstantsUtil.AUTH_CONNECTOR_ID,
        type: 'AUTH',
        name: 'w3mAuth',
        provider: 'mockProvider',
        chain: 'eip155'
      })

      expect((mockWagmiClient as any).initAuthConnectorListeners).toHaveBeenCalledWith(
        mockAuthConnector
      )
    })
  })
  describe('Wagmi Client - Listen Auth Connector', () => {
    let mockProvider: any
    let mockConnector: any

    beforeEach(() => {
      vi.resetAllMocks()
      mockProvider = {
        getLoginEmailUsed: vi.fn().mockReturnValue(false),
        onRpcRequest: vi.fn(),
        onRpcError: vi.fn(),
        onRpcSuccess: vi.fn(),
        onNotConnected: vi.fn(),
        onIsConnected: vi.fn(),
        onGetSmartAccountEnabledNetworks: vi.fn(),
        onSetPreferredAccount: vi.fn(),
        rejectRpcRequests: vi.fn(),
        onConnect: vi.fn()
      }
      mockConnector = {
        getProvider: vi.fn().mockResolvedValue(mockProvider)
      }

      mockAppKit.open = vi.fn()
      mockAppKit.isOpen = vi.fn().mockReturnValue(true)
      mockAppKit.isTransactionStackEmpty = vi.fn().mockReturnValue(false)
      mockAppKit.isTransactionShouldReplaceView = vi.fn().mockReturnValue(true)
      mockAppKit.replace = vi.fn()
    })

    it('should set up event listeners correctly', async () => {
      await (mockWagmiClient as any).listenAuthConnector(mockConnector, true)

      expect(mockProvider.onRpcRequest).toHaveBeenCalledWith(expect.any(Function))
      expect(mockProvider.onRpcError).toHaveBeenCalledWith(expect.any(Function))
      expect(mockProvider.onRpcSuccess).toHaveBeenCalledWith(expect.any(Function))
      expect(mockProvider.onNotConnected).toHaveBeenCalledWith(expect.any(Function))
      expect(mockProvider.onGetSmartAccountEnabledNetworks).toHaveBeenCalledWith(
        expect.any(Function)
      )
      expect(mockProvider.onSetPreferredAccount).toHaveBeenCalledWith(expect.any(Function))
    })

    it.skip('should handle RPC requests correctly', async () => {
      await (mockWagmiClient as any).listenAuthConnector(mockConnector, true)

      const callback = mockProvider.onRpcRequest.mock.calls[0][0]
      expect(callback).toBeDefined()

      callback({ method: 'eth_sendTransaction' })

      expect(mockAppKit.redirect).toHaveBeenCalledWith('ApproveTransaction')
    })
  })

  describe('Wagmi Client - Transports', () => {
    it('should use default transports for networks without custom transports', () => {
      const client = new WagmiAdapter({
        projectId: '123',
        networks: [mainnet, arbitrum]
      })

      expect(client.wagmiConfig._internal.transports).toBeDefined()
      expect(client.wagmiConfig._internal.transports[mainnet.id as number]).toBeDefined()
      expect(client.wagmiConfig._internal.transports[arbitrum.id as number]).toBeDefined()
    })

    it('should merge user-provided transports with default transports', () => {
      const customTransport = http('https://custom-rpc.example.com')
      const client = new WagmiAdapter({
        projectId: '123',
        networks: [mainnet, arbitrum],
        transports: {
          [mainnet.id]: customTransport
        }
      })

      expect(client.wagmiConfig._internal.transports).toBeDefined()
      expect(client.wagmiConfig._internal.transports[mainnet.id as number]).toBe(customTransport)
      expect(client.wagmiConfig._internal.transports[arbitrum.id as number]).toBeDefined()
      expect(client.wagmiConfig._internal.transports[arbitrum.id as number]).not.toBe(
        customTransport
      )
    })

    it('should prioritize user-provided transports over default ones', () => {
      const customTransport1 = http('https://custom-rpc1.example.com')
      const customTransport2 = http('https://custom-rpc2.example.com')
      const client = new WagmiAdapter({
        projectId: '123',
        networks: [mainnet, arbitrum],
        transports: {
          [mainnet.id]: customTransport1,
          [arbitrum.id]: customTransport2
        }
      })

      expect(client.wagmiConfig._internal.transports).toBeDefined()
      expect(client.wagmiConfig._internal.transports[mainnet.id as number]).toBe(customTransport1)
      expect(client.wagmiConfig._internal.transports[arbitrum.id as number]).toBe(customTransport2)
    })

    it('should handle transports for networks not in the provided networks array', () => {
      const customTransport = http('https://custom-rpc.example.com')
      const client = new WagmiAdapter({
        projectId: '123',
        networks: [mainnet],
        transports: {
          [arbitrum.id]: customTransport
        }
      })

      expect(client.wagmiConfig._internal.transports).toBeDefined()
      expect(client.wagmiConfig._internal.transports[mainnet.id as number]).toBeDefined()
      expect(client.wagmiConfig._internal.transports[arbitrum.id as number]).toBe(customTransport)
    })
  })
})
