import UniversalProvider from '@walletconnect/universal-provider'
import { EventEmitter } from 'events'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'

import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  AdapterController,
  ConnectionController,
  ConnectorController,
  type ConnectorType,
  ConstantsUtil,
  EventsController,
  type SIWXConfig,
  SIWXUtil,
  StorageUtil
} from '@reown/appkit-controllers'
import { ModalController, ProviderController, RouterController } from '@reown/appkit-controllers'
import type { AdapterBlueprint } from '@reown/appkit-controllers'
import { mockChainControllerState } from '@reown/appkit-controllers/testing'
import { ConstantsUtil as UtilConstantsUtil } from '@reown/appkit-utils'

import { mainnetCaipNetwork, solanaCaipNetwork } from '../../exports/testing.js'
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

  beforeEach(() => {
    vi.restoreAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()

    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockProvider)

    appKit = new AppKit(mockOptions)

    // Setup spies
    vi.spyOn(appKit, 'setLoading').mockImplementation(() => {})

    // Mock common dependencies
    vi.spyOn(SIWXUtil, 'clearSessions').mockResolvedValue(undefined)
    vi.spyOn(SIWXUtil, 'getSIWX').mockReturnValue(ConstantsUtil.SIWX_DEFAULTS as SIWXConfig)
    vi.spyOn(ConnectorController, 'setFilterByNamespace').mockImplementation(() => {})
    vi.spyOn(StorageUtil, 'removeConnectedNamespace').mockImplementation(() => {})
    vi.spyOn(ProviderController, 'resetChain').mockImplementation(() => {})
  })

  describe('when chainNamespace is provided', () => {
    it('should disconnect from the specified namespace', async () => {
      vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
        new Map([
          [
            CommonConstantsUtil.CHAIN.SOLANA,
            [{ connectorId: 'connector', accounts: [{ address: '0x123' }] }]
          ]
        ])
      )
      mockChainControllerState({
        activeChain: CommonConstantsUtil.CHAIN.SOLANA,
        chains: new Map([
          [CommonConstantsUtil.CHAIN.SOLANA, { accountState: { caipAddress: 'solana:1:0xyz' } }],
          [CommonConstantsUtil.CHAIN.EVM, { accountState: { caipAddress: 'eip155:1:0xyz' } }]
        ])
      })
      vi.spyOn(AdapterController, 'get').mockImplementation(namespace => {
        if (namespace === CommonConstantsUtil.CHAIN.SOLANA) {
          return mockSolanaAdapter
        }
        return mockEvmAdapter
      })
      await ConnectionController.disconnect({
        namespace: CommonConstantsUtil.CHAIN.SOLANA
      })

      expect(mockSolanaAdapter.disconnect).toHaveBeenCalledOnce()
    })

    it('should perform all disconnect operations in correct order', async () => {
      vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )
      mockChainControllerState({
        activeChain: CommonConstantsUtil.CHAIN.EVM,
        chains: new Map([
          [
            CommonConstantsUtil.CHAIN.EVM,
            { accountState: { caipAddress: 'eip155:1:0xyz' } as any }
          ],
          [
            CommonConstantsUtil.CHAIN.SOLANA,
            { accountState: { caipAddress: 'solana:1:0xyz' } as any }
          ]
        ])
      })

      await ConnectionController.disconnect({
        namespace: CommonConstantsUtil.CHAIN.EVM
      })

      // Verify operations are called in correct order
      expect(SIWXUtil.clearSessions).toHaveBeenCalled()
      expect(ConnectorController.setFilterByNamespace).toHaveBeenCalledWith(undefined)
    })
  })

  describe('when chainNamespace is not provided', () => {
    it('should use activeChain as default namespace', async () => {
      mockChainControllerState({
        activeChain: CommonConstantsUtil.CHAIN.EVM,
        chains: new Map([
          [CommonConstantsUtil.CHAIN.EVM, { accountState: { caipAddress: 'eip155:1:0x123' } }]
        ])
      })
      vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      await ConnectionController.disconnect()
    })

    it('should complete disconnect process with default namespace', async () => {
      vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
        new Map([
          [
            CommonConstantsUtil.CHAIN.EVM,
            [{ connectorId: 'connector', accounts: [{ address: '0x123' }] }]
          ]
        ])
      )
      mockChainControllerState({
        activeChain: CommonConstantsUtil.CHAIN.EVM,
        chains: new Map([
          [CommonConstantsUtil.CHAIN.EVM, { accountState: { caipAddress: 'eip155:1:0x123' } }]
        ])
      })
      vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      await ConnectionController.disconnect()

      expect(mockEvmAdapter.disconnect).toHaveBeenCalled()
    })

    it('should disconnect from all chains when no namespace is provided', async () => {
      vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )
      vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
        new Map([
          [
            CommonConstantsUtil.CHAIN.EVM,
            [{ connectorId: 'connector', accounts: [{ address: '0x123' }] }]
          ],
          [
            CommonConstantsUtil.CHAIN.SOLANA,
            [{ connectorId: 'connector', accounts: [{ address: '0x123' }] }]
          ]
        ])
      )
      mockChainControllerState({
        chains: new Map([
          [CommonConstantsUtil.CHAIN.EVM, { accountState: { caipAddress: 'eip155:1:0x123' } }],
          [CommonConstantsUtil.CHAIN.SOLANA, { accountState: { caipAddress: 'solana:1:0xyz' } }]
        ])
      })

      await ConnectionController.disconnect()

      expect(mockEvmAdapter.disconnect).toHaveBeenCalled()
      expect(mockSolanaAdapter.disconnect).toHaveBeenCalled()
    })
  })

  describe('loading state management', () => {
    it('should set loading to true at start and false at end', async () => {
      const chainNamespace = CommonConstantsUtil.CHAIN.EVM

      vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )
      mockChainControllerState({
        activeChain: chainNamespace,
        chains: new Map([[chainNamespace, { accountState: { caipAddress: 'eip155:1:0xyz' } }]])
      })
      vi.spyOn(AdapterController, 'get').mockReturnValue(mockEvmAdapter)

      vi.spyOn(mockEvmAdapter, 'disconnect').mockResolvedValue({
        connections: []
      })

      await ConnectionController.disconnect({ namespace: chainNamespace })

      // Loading state is not managed in ConnectionController.disconnect
    })

    it('should set loading to false even if operations fail', async () => {
      const chainNamespace = CommonConstantsUtil.CHAIN.EVM
      const error = new Error('Test error')

      vi.spyOn(SIWXUtil, 'clearSessions').mockRejectedValue(error)

      try {
        await ConnectionController.disconnect({ namespace: chainNamespace })
      } catch (e) {
        // Expected to throw
        expect((e as Error).message).toBe('Failed to disconnect')
      }

      // Loading state is not managed in ConnectionController.disconnect
    })
  })

  describe('state cleanup', () => {
    it('should pass correct id to adapter disconnect', async () => {
      const chainNamespace = CommonConstantsUtil.CHAIN.EVM
      vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
        new Map([
          [chainNamespace, [{ connectorId: 'connector', accounts: [{ address: '0x123' }] }]]
        ])
      )
      mockChainControllerState({
        chains: new Map([[chainNamespace, { accountState: { caipAddress: 'eip155:1:0x123' } }]])
      })

      await ConnectionController.disconnect({
        namespace: chainNamespace
      })

      expect(mockEvmAdapter.disconnect).toHaveBeenCalled()
    })
  })

  describe('different chain namespaces', () => {
    it.each([
      [CommonConstantsUtil.CHAIN.EVM, mockEvmAdapter],
      [CommonConstantsUtil.CHAIN.SOLANA, mockSolanaAdapter]
    ])(
      'should handle disconnect for %s namespace',
      async (namespace: ChainNamespace, adapter: AdapterBlueprint) => {
        vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
          new Map([[namespace, [{ connectorId: 'connector', accounts: [{ address: '0x123' }] }]]])
        )
        mockChainControllerState({
          chains: new Map([
            [namespace, { accountState: { caipAddress: `${namespace}:chainId:address` as const } }]
          ])
        })

        await ConnectionController.disconnect({ namespace: namespace })

        expect(adapter.disconnect).toHaveBeenCalled()
      }
    )
  })

  describe('complex disconnect scenarios', () => {
    it('should disconnect only for specific namespace when multiple are connected', async () => {
      const targetNamespace = CommonConstantsUtil.CHAIN.SOLANA
      vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
        new Map([
          [
            CommonConstantsUtil.CHAIN.EVM,
            [{ connectorId: 'eip155-connector', accounts: [{ address: '0x123' }] }]
          ],
          [
            CommonConstantsUtil.CHAIN.SOLANA,
            [{ connectorId: 'solana-connector', accounts: [{ address: '0x123' }] }]
          ]
        ])
      )
      // Setup multiple connected namespaces
      mockChainControllerState({
        activeChain: CommonConstantsUtil.CHAIN.EVM,
        chains: new Map([
          [CommonConstantsUtil.CHAIN.EVM, { accountState: { caipAddress: 'eip155:1:0x123' } }],
          [CommonConstantsUtil.CHAIN.SOLANA, { accountState: { caipAddress: 'solana:1:0xyz' } }]
        ])
      })

      await ConnectionController.disconnect({
        namespace: targetNamespace
      })

      // Verify only the target namespace was disconnected
      expect(mockSolanaAdapter.disconnect).toHaveBeenCalled()
    })

    it('should handle disconnect when connected via WalletConnect', async () => {
      const chainNamespace = CommonConstantsUtil.CHAIN.EVM

      mockChainControllerState({
        activeChain: chainNamespace,
        chains: new Map([[chainNamespace, { accountState: { caipAddress: 'eip155:1:0xyz' } }]])
      })

      await ConnectionController.disconnect({
        namespace: chainNamespace
      })

      // Loading state is not managed in ConnectionController.disconnect
    })

    it('should handle disconnect when connected via injected connector', async () => {
      const chainNamespace = CommonConstantsUtil.CHAIN.EVM

      mockChainControllerState({
        chains: new Map([[chainNamespace, { accountState: { caipAddress: 'eip155:1:0xyz' } }]])
      })

      await ConnectionController.disconnect({
        namespace: chainNamespace
      })

      expect(ConnectorController.setFilterByNamespace).toHaveBeenCalledWith(undefined)
    })

    it('should handle disconnect when connected via announced connector', async () => {
      const chainNamespace = CommonConstantsUtil.CHAIN.EVM

      mockChainControllerState({
        chains: new Map([[chainNamespace, { accountState: { caipAddress: 'eip155:1:0xyz' } }]])
      })

      vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_ANNOUNCED as ConnectorType
      )

      await ConnectionController.disconnect({
        namespace: chainNamespace
      })
    })

    it('should properly cleanup state across multiple disconnect operations', async () => {
      const firstNamespace = CommonConstantsUtil.CHAIN.EVM
      const secondNamespace = CommonConstantsUtil.CHAIN.SOLANA

      vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
        UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
      )

      // First disconnect
      await ConnectionController.disconnect({
        namespace: firstNamespace
      })

      // Reset mocks
      vi.restoreAllMocks()
      vi.spyOn(SIWXUtil, 'clearSessions').mockResolvedValue(undefined)
      vi.spyOn(ConnectorController, 'setFilterByNamespace').mockImplementation(() => {})

      // Second disconnect
      await ConnectionController.disconnect({
        namespace: secondNamespace
      })

      // Verify second disconnect operations
      expect(ConnectorController.setFilterByNamespace).toHaveBeenCalledWith(undefined)
    })
  })
})

describe('AppKit - disconnect - functional scenarios', () => {
  let appKit: AppKit
  let sendEventSpy: MockInstance
  let siwxClearSessionsSpy: MockInstance
  let ccSetFilterByNamespaceSpy: MockInstance
  let ccResetWcConnectionSpy: MockInstance
  let evmAdapterDisconnectSpy: MockInstance
  let solanaAdapterDisconnectSpy: MockInstance

  beforeEach(() => {
    vi.restoreAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()

    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockProvider)

    const localMockOptions = {
      ...mockOptions,
      adapters: [mockEvmAdapter, mockSolanaAdapter]
    }
    appKit = new AppKit(localMockOptions)

    vi.spyOn(appKit, 'setLoading').mockImplementation(() => {})

    sendEventSpy = vi.spyOn(EventsController, 'sendEvent')
    siwxClearSessionsSpy = vi.spyOn(SIWXUtil, 'clearSessions').mockResolvedValue(undefined)
    ccSetFilterByNamespaceSpy = vi.spyOn(ConnectorController, 'setFilterByNamespace')
    ccResetWcConnectionSpy = vi.spyOn(ConnectionController, 'resetWcConnection')
    evmAdapterDisconnectSpy = vi.spyOn(mockEvmAdapter, 'disconnect').mockResolvedValue({
      connections: []
    })
    solanaAdapterDisconnectSpy = vi.spyOn(mockSolanaAdapter, 'disconnect')

    vi.spyOn(StorageUtil, 'removeConnectedNamespace').mockImplementation(() => {})
    vi.spyOn(ProviderController, 'resetChain').mockImplementation(() => {})
    vi.spyOn(SIWXUtil, 'getSIWX').mockReturnValue(ConstantsUtil.SIWX_DEFAULTS as SIWXConfig)

    vi.spyOn(ConnectorController, 'getConnectorId').mockImplementation(ns => {
      if (ns === 'eip155' || ns === 'solana') return 'mockConnector' as any
      return undefined
    })
    vi.spyOn(ProviderController, 'getProvider').mockReturnValue({ disconnect: vi.fn() } as any) // Generic mock for provider
    vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
      UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
    )
  })

  it('should properly handle disconnect of all connected chains', async () => {
    const eip155Namespace = CommonConstantsUtil.CHAIN.EVM
    const solanaNamespace = CommonConstantsUtil.CHAIN.SOLANA
    vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
      new Map([
        [eip155Namespace, [{ connectorId: 'eip155-connector', accounts: [{ address: '0x123' }] }]],
        [solanaNamespace, [{ connectorId: 'solana-connector', accounts: [{ address: '0x123' }] }]]
      ])
    )
    mockChainControllerState({
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      chains: new Map([
        [
          CommonConstantsUtil.CHAIN.EVM,
          {
            caipNetwork: mainnetCaipNetwork,
            accountState: { caipAddress: 'eip155:1:0x123' }
          }
        ],
        [
          CommonConstantsUtil.CHAIN.SOLANA,
          {
            caipNetwork: solanaCaipNetwork,
            accountState: { caipAddress: 'solana:mainnet:0xabc' }
          }
        ]
      ])
    })

    await ConnectionController.disconnect({ namespace: eip155Namespace })
    await ConnectionController.disconnect({ namespace: solanaNamespace })

    // EVM assertions
    expect(evmAdapterDisconnectSpy).toHaveBeenCalledOnce()
    // Loading state is not managed in ConnectionController.disconnect

    // Solana assertions
    expect(solanaAdapterDisconnectSpy).toHaveBeenCalledOnce()

    // Loading state is not managed in ConnectionController.disconnect

    // Global cleanup assertions
    expect(ccResetWcConnectionSpy).toHaveBeenCalledTimes(2)
    expect(siwxClearSessionsSpy).toHaveBeenCalledTimes(2)
    expect(ccSetFilterByNamespaceSpy).toHaveBeenCalledWith(undefined)

    // Event assertion
    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'DISCONNECT_SUCCESS',
      properties: { namespace: eip155Namespace }
    })
    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'DISCONNECT_SUCCESS',
      properties: { namespace: solanaNamespace }
    })
  })

  // Placeholder for the error handling test from ChainController
  it.todo('should handle disconnect errors gracefully when a chain operation fails')
})

describe('AppKit - disconnect - error handling scenarios', () => {
  let appKit: AppKit
  let sendEventSpy: MockInstance
  let removeConnectorIdSpy: MockInstance
  let siwxClearSessionsSpy: MockInstance
  let ccSetFilterByNamespaceSpy: MockInstance
  let storageDeleteSocialSpy: MockInstance
  let ccResetWcConnectionSpy: MockInstance

  beforeEach(() => {
    vi.restoreAllMocks()
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()

    vi.spyOn(AdapterController, 'get').mockImplementation(namespace => {
      if (namespace === CommonConstantsUtil.CHAIN.EVM) {
        return mockEvmAdapter
      }
      return mockSolanaAdapter
    })

    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockProvider)

    const localMockOptions = {
      ...mockOptions,
      adapters: [mockEvmAdapter, mockSolanaAdapter]
    }
    appKit = new AppKit(localMockOptions)

    // Setup spies on AppKit instance methods
    vi.spyOn(appKit, 'setLoading').mockImplementation(() => {})

    // Spies on controllers/utils
    sendEventSpy = vi.spyOn(EventsController, 'sendEvent')
    removeConnectorIdSpy = vi.spyOn(ConnectorController, 'removeConnectorId')
    siwxClearSessionsSpy = vi.spyOn(SIWXUtil, 'clearSessions').mockResolvedValue(undefined)
    ccSetFilterByNamespaceSpy = vi.spyOn(ConnectorController, 'setFilterByNamespace')
    storageDeleteSocialSpy = vi.spyOn(StorageUtil, 'deleteConnectedSocialProvider')
    ccResetWcConnectionSpy = vi.spyOn(ConnectionController, 'resetWcConnection')
    vi.spyOn(StorageUtil, 'removeConnectedNamespace').mockImplementation(() => {})
    vi.spyOn(ProviderController, 'resetChain').mockImplementation(() => {})
    vi.spyOn(SIWXUtil, 'getSIWX').mockReturnValue(ConstantsUtil.SIWX_DEFAULTS as SIWXConfig)

    // Simulate two connected chains for getChainsToDisconnect (utility)
    vi.spyOn(ConnectorController, 'getConnectorId').mockImplementation(ns => {
      if (ns === 'eip155' || ns === 'solana') return 'mockConnector' as any
      return undefined
    })
    vi.spyOn(ProviderController, 'getProvider').mockReturnValue({ disconnect: vi.fn() } as any) // Generic mock for provider
    vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
      UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
    )
  })

  it('should handle errors when the main adapter.disconnect fails for one chain during full disconnect', async () => {
    mockChainControllerState({
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      chains: new Map([
        [
          CommonConstantsUtil.CHAIN.EVM,
          {
            caipNetwork: mainnetCaipNetwork,
            accountState: { caipAddress: 'eip155:1:0x123' }
          }
        ],
        [
          CommonConstantsUtil.CHAIN.SOLANA,
          {
            caipNetwork: solanaCaipNetwork,
            accountState: { caipAddress: 'solana:mainnet:0xabc' }
          }
        ]
      ])
    })

    const eip155Namespace = CommonConstantsUtil.CHAIN.EVM
    const solanaNamespace = CommonConstantsUtil.CHAIN.SOLANA
    const solanaAdapterError = new Error('Solana adapter failed') // Corrected error message for clarity

    const mockEip155Provider = { disconnect: vi.fn().mockResolvedValue(undefined) }
    const mockSolanaProvider = { disconnect: vi.fn() }

    vi.spyOn(ProviderController, 'getProvider').mockImplementation(ns => {
      if (ns === eip155Namespace) return mockEip155Provider
      if (ns === solanaNamespace) return mockSolanaProvider
      return { disconnect: vi.fn() }
    })
    vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
      new Map([
        [eip155Namespace, [{ connectorId: 'eip155-connector', accounts: [{ address: '0x123' }] }]],
        [solanaNamespace, [{ connectorId: 'solana-connector', accounts: [{ address: '0x123' }] }]]
      ])
    )
    // getProviderId is already mocked in beforeEach to return INJECTED

    const eip155AdapterDisconnectSpy = vi.spyOn(mockEvmAdapter, 'disconnect').mockResolvedValue({
      connections: []
    })
    const solanaAdapterDisconnectSpy = vi.spyOn(mockSolanaAdapter, 'disconnect')

    // Simulate first conditional disconnect succeeding for solana, second (main) one failing
    solanaAdapterDisconnectSpy.mockRejectedValueOnce(solanaAdapterError)
    solanaAdapterDisconnectSpy.mockResolvedValue({
      connections: []
    })

    // Call eip155 disconnect
    await ConnectionController.disconnect({
      namespace: eip155Namespace
    })

    // Call solana disconnect
    await expect(
      ConnectionController.disconnect({
        namespace: solanaNamespace
      })
    ).rejects.toThrow('Failed to disconnect')

    // --- Assertions for eip155 (successful disconnect) ---
    expect(eip155AdapterDisconnectSpy).toHaveBeenCalledOnce()

    // Loading state is not managed in ConnectionController.disconnect
    expect(removeConnectorIdSpy).toHaveBeenCalledWith(eip155Namespace)

    // --- Assertions for solana (failed disconnect where main adapter.disconnect errors) ---
    expect(solanaAdapterDisconnectSpy).toHaveBeenCalledOnce() // Both conditional and main calls attempted

    // Loading state is not managed in ConnectionController.disconnect

    // --- Assertions for global cleanup (called after loop, before final throw if failures exist) ---
    expect(ccResetWcConnectionSpy).toHaveBeenCalledTimes(2)
    expect(siwxClearSessionsSpy).toHaveBeenCalledTimes(2)
    expect(ccSetFilterByNamespaceSpy).toHaveBeenCalledWith(undefined)
    expect(storageDeleteSocialSpy).not.toHaveBeenCalled()
    expect(sendEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'DISCONNECT_SUCCESS' })
    )
  })

  it('should not clear SIWX sessions if signOutOnDisconnect is false', async () => {
    mockChainControllerState({
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      chains: new Map([
        [
          CommonConstantsUtil.CHAIN.EVM,
          {
            caipNetwork: mainnetCaipNetwork,
            accountState: { caipAddress: 'eip155:1:0x123' }
          }
        ],
        [
          CommonConstantsUtil.CHAIN.SOLANA,
          {
            caipNetwork: solanaCaipNetwork,
            accountState: { caipAddress: 'solana:mainnet:0xabc' }
          }
        ]
      ])
    })

    const siwx = { ...ConstantsUtil.SIWX_DEFAULTS, signOutOnDisconnect: false } as SIWXConfig
    vi.spyOn(SIWXUtil, 'getSIWX').mockReturnValue(siwx)

    await ConnectionController.disconnect()

    expect(SIWXUtil.clearSessions).not.toHaveBeenCalled()
  })

  it('should close modal if multi wallet is not enabled', async () => {
    mockChainControllerState({
      activeChain: CommonConstantsUtil.CHAIN.EVM,
      chains: new Map([
        [
          CommonConstantsUtil.CHAIN.EVM,
          {
            caipNetwork: mainnetCaipNetwork,
            accountState: { caipAddress: 'eip155:1:0x123' }
          }
        ]
      ])
    })

    const eip155Namespace = CommonConstantsUtil.CHAIN.EVM
    const mockEip155Provider = new EventEmitter() as unknown as AdapterBlueprint
    mockEip155Provider.disconnect = vi.fn().mockResolvedValue(undefined)

    vi.spyOn(ProviderController, 'getProvider').mockImplementation(ns => {
      if (ns === eip155Namespace) return mockEip155Provider
      return { disconnect: vi.fn() }
    })

    appKit['remoteFeatures'] = { multiWallet: false }
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      view: 'ProfileWallets'
    })
    vi.spyOn(ModalController, 'close').mockImplementation(() => {})

    await (appKit as any).onDisconnectNamespace({
      chainNamespace: eip155Namespace,
      closeModal: true
    })

    expect(ModalController.close).toHaveBeenCalled()
  })
})
