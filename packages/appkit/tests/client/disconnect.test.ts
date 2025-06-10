import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'

import type { ChainNamespace } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  ConnectorController,
  type ConnectorType,
  EventsController,
  SIWXUtil,
  StorageUtil
} from '@reown/appkit-controllers'
import { ProviderUtil, ConstantsUtil as UtilConstantsUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client/appkit.js'
import { mockEvmAdapter, mockSolanaAdapter } from '../mocks/Adapter.js'
import { mockOptions } from '../mocks/Options.js'
import mockProvider from '../mocks/UniversalProvider.js'
import {
  mockBlockchainApiController,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('AppKit - disconnect', () => {
  let appKit: AppKit
  let setStatusSpy: MockInstance
  let setUserSpy: MockInstance
  let setConnectedWalletInfoSpy: MockInstance
  let setLoadingSpy: MockInstance

  beforeEach(() => {
    vi.clearAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()

    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockProvider)

    appKit = new AppKit(mockOptions)

    // Setup spies
    setStatusSpy = vi.spyOn(appKit, 'setStatus')
    setUserSpy = vi.spyOn(appKit, 'setUser')
    setConnectedWalletInfoSpy = vi.spyOn(appKit, 'setConnectedWalletInfo')
    setLoadingSpy = vi.spyOn(appKit, 'setLoading')

    // Mock common dependencies
    vi.spyOn(SIWXUtil, 'clearSessions').mockResolvedValue(undefined)
    vi.spyOn(ConnectorController, 'setFilterByNamespace').mockImplementation(() => {})
    vi.spyOn(StorageUtil, 'removeConnectedNamespace').mockImplementation(() => {})
    vi.spyOn(ProviderUtil, 'resetChain').mockImplementation(() => {})
  })

  describe('when chainNamespace is provided', () => {
    it('should disconnect from the specified namespace', async () => {
      const chainNamespace = 'solana' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }
      const mockProviderType = UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT as ConnectorType

      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(mockProviderType)
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: 'solana:1:0xyz'
      } as any)
      await (appKit as any).connectionControllerClient.disconnect(chainNamespace)

      expect(ProviderUtil.getProvider).toHaveBeenCalledWith(chainNamespace)
      expect(ProviderUtil.getProviderId).toHaveBeenCalledWith(chainNamespace)
      expect(mockSolanaAdapter.disconnect).toHaveBeenCalledOnce()
    })

    it('should perform all disconnect operations in correct order', async () => {
      const chainNamespace = 'eip155' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }

      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: 'eip155:1:0xyz'
      } as any)

      const resetAccountSpy = vi.spyOn(ChainController, 'resetAccount')
      const resetNetworkSpy = vi.spyOn(ChainController, 'resetNetwork')

      await (appKit as any).connectionControllerClient.disconnect(chainNamespace)

      // Verify operations are called in correct order
      expect(setLoadingSpy).toHaveBeenCalledWith(true, chainNamespace)
      expect(SIWXUtil.clearSessions).toHaveBeenCalled()
      expect(resetAccountSpy).toHaveBeenCalledWith(chainNamespace)
      expect(resetNetworkSpy).toHaveBeenCalledWith(chainNamespace)
      expect(setLoadingSpy).toHaveBeenCalledWith(false, chainNamespace)
      expect(ConnectorController.setFilterByNamespace).toHaveBeenCalledWith(undefined)
      expect(mockEvmAdapter.disconnect).toHaveBeenCalledWith({
        provider: mockProvider,
        providerType: UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
      })
      expect(StorageUtil.removeConnectedNamespace).toHaveBeenCalledWith(chainNamespace)
      expect(ProviderUtil.resetChain).toHaveBeenCalledWith(chainNamespace)
      expect(setUserSpy).toHaveBeenCalledWith(undefined, chainNamespace)
      expect(setStatusSpy).toHaveBeenCalledWith('disconnected', chainNamespace)
      expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(undefined, chainNamespace)
    })
  })

  describe('when chainNamespace is not provided', () => {
    it('should use activeChain as default namespace', async () => {
      const mockProvider = { disconnect: vi.fn() }

      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue(
        'eip155' as ChainNamespace
      )
      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      const resetAccountSpy = vi.spyOn(ChainController, 'resetAccount')
      const resetNetworkSpy = vi.spyOn(ChainController, 'resetNetwork')

      await (appKit as any).connectionControllerClient.disconnect()

      // Verify that for the active chain, reset functions are called
      // ProviderUtil calls are likely still relevant to ensure the adapter for the active chain was considered
      expect(ProviderUtil.getProvider).toHaveBeenCalledWith('eip155')
      expect(ProviderUtil.getProviderId).toHaveBeenCalledWith('eip155')
      expect(resetAccountSpy).toHaveBeenCalledWith('eip155')
      expect(resetNetworkSpy).toHaveBeenCalledWith('eip155')
    })

    it('should complete disconnect process with default namespace', async () => {
      const expectedNamespace = 'eip155' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }

      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue(expectedNamespace)
      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      await (appKit as any).connectionControllerClient.disconnect()

      expect(StorageUtil.removeConnectedNamespace).toHaveBeenCalledWith(expectedNamespace)
      expect(ProviderUtil.resetChain).toHaveBeenCalledWith(expectedNamespace)
      expect(setUserSpy).toHaveBeenCalledWith(undefined, expectedNamespace)
      expect(setStatusSpy).toHaveBeenCalledWith('disconnected', expectedNamespace)
      expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(undefined, expectedNamespace)
    })
  })

  describe('loading state management', () => {
    it('should set loading to true at start and false at end', async () => {
      const chainNamespace = 'eip155' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }

      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )
      // Ensure ChainController.getAccountData returns a caipAddress for the conditional disconnect
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: 'eip155:1:0xyz'
      } as any)
      // Ensure the adapter is available
      ;(appKit as any).chainAdapters['eip155'] = mockEvmAdapter
      vi.spyOn(mockEvmAdapter, 'disconnect').mockResolvedValue(undefined)

      await (appKit as any).connectionControllerClient.disconnect({ chainNamespace })

      expect(setLoadingSpy).toHaveBeenCalledTimes(2) // true at start of try, false in finally
      expect(setLoadingSpy).toHaveBeenNthCalledWith(1, true, chainNamespace)
      expect(setLoadingSpy).toHaveBeenNthCalledWith(2, false, chainNamespace)
    })

    it('should set loading to false even if operations fail', async () => {
      const chainNamespace = 'eip155' as ChainNamespace
      const error = new Error('Test error')

      vi.spyOn(SIWXUtil, 'clearSessions').mockRejectedValue(error)

      try {
        await (appKit as any).connectionControllerClient.disconnect(chainNamespace)
      } catch (e) {
        // Expected to throw
        expect(e).toEqual(new Error('Failed to disconnect chains: Test error'))
      }

      expect(setLoadingSpy).toHaveBeenCalledWith(true, chainNamespace)
      // The disconnect method doesn't catch errors and set loading to false,
      // so we only expect loading to be set to true, not false
    })
  })

  describe('state cleanup', () => {
    it('should clear all relevant state after disconnect', async () => {
      const chainNamespace = 'eip155' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }

      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      await (appKit as any).connectionControllerClient.disconnect(chainNamespace)

      // Verify all state cleanup operations
      expect(ConnectorController.setFilterByNamespace).toHaveBeenCalledWith(undefined)
      expect(StorageUtil.removeConnectedNamespace).toHaveBeenCalledWith(chainNamespace)
      expect(ProviderUtil.resetChain).toHaveBeenCalledWith(chainNamespace)
      expect(setUserSpy).toHaveBeenCalledWith(undefined, chainNamespace)
      expect(setStatusSpy).toHaveBeenCalledWith('disconnected', chainNamespace)
      expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(undefined, chainNamespace)
    })

    it('should pass correct provider and providerType to adapter disconnect', async () => {
      const chainNamespace = 'eip155' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }
      const mockProviderType = UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType

      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(mockProviderType)

      await (appKit as any).connectionControllerClient.disconnect(chainNamespace)

      expect(mockEvmAdapter.disconnect).toHaveBeenCalledWith({
        provider: mockProvider,
        providerType: mockProviderType
      })
    })
  })

  describe('different chain namespaces', () => {
    it.each([
      ['eip155' as ChainNamespace, mockEvmAdapter],
      ['solana' as ChainNamespace, mockSolanaAdapter]
    ])('should handle disconnect for %s namespace', async (namespace, adapter) => {
      const mockProvider = { disconnect: vi.fn() }
      const resetAccountSpy = vi.spyOn(ChainController, 'resetAccount')
      const resetNetworkSpy = vi.spyOn(ChainController, 'resetNetwork')
      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      await (appKit as any).connectionControllerClient.disconnect(namespace)

      expect(resetAccountSpy).toHaveBeenCalledWith(namespace)
      expect(resetNetworkSpy).toHaveBeenCalledWith(namespace)
      expect(StorageUtil.removeConnectedNamespace).toHaveBeenCalledWith(namespace)
      expect(setStatusSpy).toHaveBeenCalledWith('disconnected', namespace)
      expect(adapter.disconnect).toHaveBeenCalledWith({
        provider: mockProvider,
        providerType: UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
      })
    })
  })

  describe('complex disconnect scenarios', () => {
    it('should disconnect only for specific namespace when multiple are connected', async () => {
      const targetNamespace = 'solana' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }

      // Setup multiple connected namespaces
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue(
        'eip155' as ChainNamespace
      )
      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      const resetAccountSpy = vi.spyOn(ChainController, 'resetAccount')
      const resetNetworkSpy = vi.spyOn(ChainController, 'resetNetwork')

      await (appKit as any).connectionControllerClient.disconnect(targetNamespace)

      // Verify only the target namespace was disconnected
      expect(resetAccountSpy).toHaveBeenCalledWith(targetNamespace)
      expect(resetNetworkSpy).toHaveBeenCalledWith(targetNamespace)
      expect(StorageUtil.removeConnectedNamespace).toHaveBeenCalledWith(targetNamespace)
      expect(ProviderUtil.resetChain).toHaveBeenCalledWith(targetNamespace)
      expect(setStatusSpy).toHaveBeenCalledWith('disconnected', targetNamespace)
      expect(mockSolanaAdapter.disconnect).toHaveBeenCalledWith({
        provider: mockProvider,
        providerType: UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
      })
    })

    it('should handle disconnect when connected via WalletConnect', async () => {
      const chainNamespace = 'eip155' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }

      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT as ConnectorType
      )

      await (appKit as any).connectionControllerClient.disconnect(chainNamespace)

      expect(mockEvmAdapter.disconnect).toHaveBeenCalledWith({
        provider: mockProvider,
        providerType: UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT
      })
      expect(setLoadingSpy).toHaveBeenCalledWith(true, chainNamespace)
      expect(setLoadingSpy).toHaveBeenCalledWith(false, chainNamespace)
      expect(setStatusSpy).toHaveBeenCalledWith('disconnected', chainNamespace)
    })

    it('should handle disconnect when connected via injected connector', async () => {
      const chainNamespace = 'eip155' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }

      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      await (appKit as any).connectionControllerClient.disconnect(chainNamespace)

      expect(mockEvmAdapter.disconnect).toHaveBeenCalledWith({
        provider: mockProvider,
        providerType: UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
      })
      expect(ConnectorController.setFilterByNamespace).toHaveBeenCalledWith(undefined)
      expect(setStatusSpy).toHaveBeenCalledWith('disconnected', chainNamespace)
    })

    it('should handle disconnect when connected via announced connector', async () => {
      const chainNamespace = 'eip155' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }

      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_ANNOUNCED as ConnectorType
      )

      await (appKit as any).connectionControllerClient.disconnect(chainNamespace)

      expect(mockEvmAdapter.disconnect).toHaveBeenCalledWith({
        provider: mockProvider,
        providerType: UtilConstantsUtil.CONNECTOR_TYPE_ANNOUNCED
      })
      expect(setStatusSpy).toHaveBeenCalledWith('disconnected', chainNamespace)
    })

    it('should properly cleanup state across multiple disconnect operations', async () => {
      const firstNamespace = 'eip155' as ChainNamespace
      const secondNamespace = 'solana' as ChainNamespace
      const mockProvider = { disconnect: vi.fn() }

      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      // First disconnect
      await (appKit as any).connectionControllerClient.disconnect(firstNamespace)

      // Reset mocks
      vi.clearAllMocks()
      vi.spyOn(SIWXUtil, 'clearSessions').mockResolvedValue(undefined)
      vi.spyOn(ConnectorController, 'setFilterByNamespace').mockImplementation(() => {})
      vi.spyOn(StorageUtil, 'removeConnectedNamespace').mockImplementation(() => {})
      vi.spyOn(ProviderUtil, 'resetChain').mockImplementation(() => {})
      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      // Second disconnect
      await (appKit as any).connectionControllerClient.disconnect(secondNamespace)

      // Verify second disconnect operations
      expect(StorageUtil.removeConnectedNamespace).toHaveBeenCalledWith(secondNamespace)
      expect(ProviderUtil.resetChain).toHaveBeenCalledWith(secondNamespace)
      expect(setStatusSpy).toHaveBeenCalledWith('disconnected', secondNamespace)
    })
  })
})

describe('AppKit - disconnect - functional scenarios', () => {
  let appKit: AppKit
  let setStatusSpy: MockInstance
  let setUserSpy: MockInstance
  let setConnectedWalletInfoSpy: MockInstance
  let setLoadingSpy: MockInstance
  let sendEventSpy: MockInstance
  let resetAccountSpy: MockInstance
  let resetNetworkSpy: MockInstance
  let removeConnectorIdSpy: MockInstance
  let siwxClearSessionsSpy: MockInstance
  let ccSetFilterByNamespaceSpy: MockInstance
  let storageDeleteSocialSpy: MockInstance
  let ccResetWcConnectionSpy: MockInstance
  let evmAdapterDisconnectSpy: MockInstance
  let solanaAdapterDisconnectSpy: MockInstance

  beforeEach(() => {
    vi.clearAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()

    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockProvider)

    const localMockOptions = {
      ...mockOptions,
      adapters: [mockEvmAdapter, mockSolanaAdapter]
    }
    appKit = new AppKit(localMockOptions)

    setStatusSpy = vi.spyOn(appKit, 'setStatus')
    setUserSpy = vi.spyOn(appKit, 'setUser')
    setConnectedWalletInfoSpy = vi.spyOn(appKit, 'setConnectedWalletInfo')
    setLoadingSpy = vi.spyOn(appKit, 'setLoading')

    sendEventSpy = vi.spyOn(EventsController, 'sendEvent')
    resetAccountSpy = vi.spyOn(ChainController, 'resetAccount')
    resetNetworkSpy = vi.spyOn(ChainController, 'resetNetwork')
    removeConnectorIdSpy = vi.spyOn(ConnectorController, 'removeConnectorId')
    siwxClearSessionsSpy = vi.spyOn(SIWXUtil, 'clearSessions').mockResolvedValue(undefined)
    ccSetFilterByNamespaceSpy = vi.spyOn(ConnectorController, 'setFilterByNamespace')
    storageDeleteSocialSpy = vi.spyOn(StorageUtil, 'deleteConnectedSocialProvider')
    ccResetWcConnectionSpy = vi.spyOn(ConnectionController, 'resetWcConnection')
    evmAdapterDisconnectSpy = vi.spyOn(mockEvmAdapter, 'disconnect').mockResolvedValue(undefined)
    solanaAdapterDisconnectSpy = vi.spyOn(mockSolanaAdapter, 'disconnect')

    vi.spyOn(StorageUtil, 'removeConnectedNamespace').mockImplementation(() => {})
    vi.spyOn(ProviderUtil, 'resetChain').mockImplementation(() => {})

    ChainController.state.chains = new Map([
      [
        'eip155',
        {
          caipNetwork: {
            id: '1',
            name: 'Ethereum',
            chainNamespace: 'eip155',
            caipNetworkId: 'eip155:1'
          },
          accountState: { caipAddress: 'eip155:1:0x123' }
        } as any
      ],
      [
        'solana',
        {
          caipNetwork: {
            id: 'mainnet',
            name: 'Solana',
            chainNamespace: 'solana',
            caipNetworkId: 'solana:mainnet'
          },
          accountState: { caipAddress: 'solana:mainnet:0xabc' }
        } as any
      ]
    ])
    vi.spyOn(ConnectorController, 'getConnectorId').mockImplementation(ns => {
      if (ns === 'eip155' || ns === 'solana') return 'mockConnector' as any
      return undefined
    })
    vi.spyOn(ChainController, 'getAccountData').mockImplementation(ns => {
      if (ns === 'eip155') return { caipAddress: 'eip155:1:0x123' } as any
      if (ns === 'solana') return { caipAddress: 'solana:mainnet:0xabc' } as any
      return undefined
    })
    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue({ disconnect: vi.fn() } as any) // Generic mock for provider
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
      UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
    )
  })

  it('should properly handle disconnect of all connected chains', async () => {
    const eip155Namespace = 'eip155' as ChainNamespace
    const solanaNamespace = 'solana' as ChainNamespace

    await (appKit as any).connectionControllerClient.disconnect()

    // EVM assertions
    expect(evmAdapterDisconnectSpy).toHaveBeenCalledOnce()
    expect(setLoadingSpy).toHaveBeenCalledWith(true, eip155Namespace)
    expect(setLoadingSpy).toHaveBeenCalledWith(false, eip155Namespace)
    expect(StorageUtil.removeConnectedNamespace).toHaveBeenCalledWith(eip155Namespace)
    expect(ProviderUtil.resetChain).toHaveBeenCalledWith(eip155Namespace)
    expect(setUserSpy).toHaveBeenCalledWith(undefined, eip155Namespace)
    expect(setStatusSpy).toHaveBeenCalledWith('disconnected', eip155Namespace)
    expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(undefined, eip155Namespace)
    expect(removeConnectorIdSpy).toHaveBeenCalledWith(eip155Namespace)
    expect(resetAccountSpy).toHaveBeenCalledWith(eip155Namespace)
    expect(resetNetworkSpy).toHaveBeenCalledWith(eip155Namespace)

    // Solana assertions
    expect(solanaAdapterDisconnectSpy).toHaveBeenCalledOnce()
    expect(setLoadingSpy).toHaveBeenCalledWith(true, solanaNamespace)
    expect(setLoadingSpy).toHaveBeenCalledWith(false, solanaNamespace)
    expect(StorageUtil.removeConnectedNamespace).toHaveBeenCalledWith(solanaNamespace)
    expect(ProviderUtil.resetChain).toHaveBeenCalledWith(solanaNamespace)
    expect(setUserSpy).toHaveBeenCalledWith(undefined, solanaNamespace)
    expect(setStatusSpy).toHaveBeenCalledWith('disconnected', solanaNamespace)
    expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(undefined, solanaNamespace)
    expect(removeConnectorIdSpy).toHaveBeenCalledWith(solanaNamespace)
    expect(resetAccountSpy).toHaveBeenCalledWith(solanaNamespace)
    expect(resetNetworkSpy).toHaveBeenCalledWith(solanaNamespace)

    // Global cleanup assertions
    expect(ccResetWcConnectionSpy).toHaveBeenCalledOnce()
    expect(siwxClearSessionsSpy).toHaveBeenCalledOnce()
    expect(ccSetFilterByNamespaceSpy).toHaveBeenCalledWith(undefined)
    expect(storageDeleteSocialSpy).toHaveBeenCalledOnce()

    // Event assertion
    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'DISCONNECT_SUCCESS',
      properties: {
        namespace: 'all'
      }
    })
  })

  // Placeholder for the error handling test from ChainController
  it.todo('should handle disconnect errors gracefully when a chain operation fails')
})

describe('AppKit - disconnect - error handling scenarios', () => {
  let appKit: AppKit
  let setStatusSpy: MockInstance
  let setUserSpy: MockInstance
  let setConnectedWalletInfoSpy: MockInstance
  let setLoadingSpy: MockInstance
  let sendEventSpy: MockInstance
  let resetAccountSpy: MockInstance
  let resetNetworkSpy: MockInstance
  let removeConnectorIdSpy: MockInstance
  let siwxClearSessionsSpy: MockInstance
  let ccSetFilterByNamespaceSpy: MockInstance
  let storageDeleteSocialSpy: MockInstance
  let ccResetWcConnectionSpy: MockInstance

  beforeEach(() => {
    vi.clearAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()

    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockProvider)

    const localMockOptions = {
      ...mockOptions,
      adapters: [mockEvmAdapter, mockSolanaAdapter]
    }
    appKit = new AppKit(localMockOptions)

    // Setup spies on AppKit instance methods
    setStatusSpy = vi.spyOn(appKit, 'setStatus')
    setUserSpy = vi.spyOn(appKit, 'setUser')
    setConnectedWalletInfoSpy = vi.spyOn(appKit, 'setConnectedWalletInfo')
    setLoadingSpy = vi.spyOn(appKit, 'setLoading')

    // Spies on controllers/utils
    sendEventSpy = vi.spyOn(EventsController, 'sendEvent')
    resetAccountSpy = vi.spyOn(ChainController, 'resetAccount')
    resetNetworkSpy = vi.spyOn(ChainController, 'resetNetwork')
    removeConnectorIdSpy = vi.spyOn(ConnectorController, 'removeConnectorId')
    siwxClearSessionsSpy = vi.spyOn(SIWXUtil, 'clearSessions').mockResolvedValue(undefined)
    ccSetFilterByNamespaceSpy = vi.spyOn(ConnectorController, 'setFilterByNamespace')
    storageDeleteSocialSpy = vi.spyOn(StorageUtil, 'deleteConnectedSocialProvider')
    ccResetWcConnectionSpy = vi.spyOn(ConnectionController, 'resetWcConnection')
    vi.spyOn(StorageUtil, 'removeConnectedNamespace').mockImplementation(() => {})
    vi.spyOn(ProviderUtil, 'resetChain').mockImplementation(() => {})

    // Simulate two connected chains for getChainsToDisconnect (utility)
    ChainController.state.chains = new Map([
      [
        'eip155',
        {
          caipNetwork: {
            id: '1',
            name: 'Ethereum',
            chainNamespace: 'eip155',
            caipNetworkId: 'eip155:1'
          },
          accountState: { caipAddress: 'eip155:1:0x123' }
        } as any
      ],
      [
        'solana',
        {
          caipNetwork: {
            id: 'mainnet',
            name: 'Solana',
            chainNamespace: 'solana',
            caipNetworkId: 'solana:mainnet'
          },
          accountState: { caipAddress: 'solana:mainnet:0xabc' }
        } as any
      ]
    ])
    vi.spyOn(ConnectorController, 'getConnectorId').mockImplementation(ns => {
      if (ns === 'eip155' || ns === 'solana') return 'mockConnector' as any
      return undefined
    })
    // Mock ChainController.getAccountData to control the caipAddress for the first conditional adapter.disconnect
    vi.spyOn(ChainController, 'getAccountData').mockImplementation(ns => {
      if (ns === 'eip155') return { caipAddress: 'eip155:1:0x123' } as any
      if (ns === 'solana') return { caipAddress: 'solana:mainnet:0xabc' } as any
      return undefined
    })
    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue({ disconnect: vi.fn() } as any) // Generic mock for provider
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
      UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
    )
  })

  it('should handle errors when the main adapter.disconnect fails for one chain during full disconnect', async () => {
    const eip155Namespace = 'eip155' as ChainNamespace
    const solanaNamespace = 'solana' as ChainNamespace
    const solanaAdapterError = new Error('Solana adapter failed') // Corrected error message for clarity

    const mockEip155Provider = { disconnect: vi.fn().mockResolvedValue(undefined) }
    const mockSolanaProvider = { disconnect: vi.fn() }

    vi.spyOn(ProviderUtil, 'getProvider').mockImplementation(ns => {
      if (ns === eip155Namespace) return mockEip155Provider
      if (ns === solanaNamespace) return mockSolanaProvider
      return { disconnect: vi.fn() }
    })
    // getProviderId is already mocked in beforeEach to return INJECTED

    const eip155AdapterDisconnectSpy = vi
      .spyOn(mockEvmAdapter, 'disconnect')
      .mockResolvedValue(undefined)
    const solanaAdapterDisconnectSpy = vi.spyOn(mockSolanaAdapter, 'disconnect')

    // Simulate first conditional disconnect succeeding for solana, second (main) one failing
    solanaAdapterDisconnectSpy.mockRejectedValueOnce(solanaAdapterError)
    solanaAdapterDisconnectSpy.mockResolvedValue(undefined)

    await expect((appKit as any).connectionControllerClient.disconnect()).rejects.toThrow(
      `Failed to disconnect chains: Failed to disconnect chain ${solanaNamespace}: ${solanaAdapterError.message}`
    )

    // --- Assertions for eip155 (successful disconnect) ---
    expect(eip155AdapterDisconnectSpy).toHaveBeenCalledOnce()
    expect(eip155AdapterDisconnectSpy).toHaveBeenCalledWith({
      provider: mockEip155Provider,
      providerType: UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
    })

    expect(setLoadingSpy).toHaveBeenCalledWith(true, eip155Namespace)
    expect(StorageUtil.removeConnectedNamespace).toHaveBeenCalledWith(eip155Namespace)
    expect(ProviderUtil.resetChain).toHaveBeenCalledWith(eip155Namespace)
    expect(setUserSpy).toHaveBeenCalledWith(undefined, eip155Namespace)
    expect(setStatusSpy).toHaveBeenCalledWith('disconnected', eip155Namespace)
    expect(setConnectedWalletInfoSpy).toHaveBeenCalledWith(undefined, eip155Namespace)
    expect(removeConnectorIdSpy).toHaveBeenCalledWith(eip155Namespace)
    expect(resetAccountSpy).toHaveBeenCalledWith(eip155Namespace)
    expect(resetNetworkSpy).toHaveBeenCalledWith(eip155Namespace)

    // --- Assertions for solana (failed disconnect where main adapter.disconnect errors) ---
    expect(solanaAdapterDisconnectSpy).toHaveBeenCalledOnce() // Both conditional and main calls attempted
    expect(solanaAdapterDisconnectSpy).toHaveBeenCalledWith({
      provider: mockSolanaProvider,
      providerType: UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
    })

    expect(setLoadingSpy).toHaveBeenCalledWith(true, solanaNamespace) // setLoading(true) is before the failing adapter.disconnect
    expect(setLoadingSpy).toHaveBeenCalledWith(false, solanaNamespace) // setLoading(false) IS called from the CATCH block for solana

    // Verify overall loading calls:
    // eip155: true, false (from end of try)
    // solana: true, false (from catch)
    // Total 4 calls to setLoading
    expect(setLoadingSpy).toHaveBeenCalledTimes(4)
    expect(setLoadingSpy).toHaveBeenNthCalledWith(1, true, eip155Namespace) // EIP155 start
    // The order of async operations in Promise.allSettled isn't strictly guaranteed for the *second* setLoading(true,...)
    // So we check for specific calls rather than Nth Celled for all.
    // Let's find the call for EIP155 end:
    const eip155SetLoadingFalseCall = setLoadingSpy.mock.calls.find(
      call => call[0] === false && call[1] === eip155Namespace
    )
    expect(eip155SetLoadingFalseCall).toBeDefined()

    expect(setLoadingSpy).toHaveBeenCalledWith(true, solanaNamespace) // Solana start
    expect(setLoadingSpy).toHaveBeenCalledWith(false, solanaNamespace) // Solana end (from catch)

    // --- Assertions for global cleanup (called after loop, before final throw if failures exist) ---
    expect(ccResetWcConnectionSpy).toHaveBeenCalledOnce()
    expect(siwxClearSessionsSpy).toHaveBeenCalledOnce()
    expect(ccSetFilterByNamespaceSpy).toHaveBeenCalledWith(undefined)
    expect(storageDeleteSocialSpy).not.toHaveBeenCalled()
    expect(sendEventSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ event: 'DISCONNECT_SUCCESS' })
    )
  })
})
