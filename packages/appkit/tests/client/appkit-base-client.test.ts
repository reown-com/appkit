import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import type { CaipNetwork, CaipNetworkId, ChainNamespace } from '@reown/appkit-common'
import {
  AlertController,
  ApiController,
  type ChainAdapter,
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  ModalController,
  type RemoteFeatures,
  SendController,
  WcHelpersUtil
} from '@reown/appkit-controllers'
import { mockChainControllerState } from '@reown/appkit-controllers/testing'
import { ErrorUtil, TokenUtil } from '@reown/appkit-utils'

import { AppKitBaseClient } from '../../src/client/appkit-base-client'
import { ConfigUtil } from '../../src/utils/ConfigUtil'
import { mainnet } from '../mocks/Networks'

describe('AppKitBaseClient.checkAllowedOrigins', () => {
  let baseClient: AppKitBaseClient
  let alertSpy: any

  beforeAll(() => {
    // Mock document for getDefaultMetaData method
    Object.defineProperty(globalThis, 'document', {
      value: {
        getElementsByTagName: vi.fn(),
        querySelector: vi.fn()
      },
      writable: true
    })

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: {
          readText: vi.fn(() => Promise.resolve(''))
        }
      },
      writable: true
    })

    Object.defineProperty(globalThis, 'window', {
      value: { location: { origin: 'https://appkit-lab.reown.com' } },
      writable: true
    })
  })

  beforeEach(() => {
    vi.restoreAllMocks()
    baseClient = new (class extends AppKitBaseClient {
      constructor() {
        super({
          projectId: 'test-project-id',
          networks: [mainnet],
          adapters: [],
          sdkVersion: 'html-wagmi-1'
        })
      }

      async injectModalUi() {}
      async syncIdentity() {}

      override async syncAdapterConnections() {
        return Promise.resolve()
      }
    })()
    alertSpy = vi.spyOn(AlertController, 'open').mockImplementation(() => {})
  })

  it('should show RATE_LIMITED_APP_CONFIGURATION alert for RATE_LIMITED error', async () => {
    const rateLimitedError = new Error('RATE_LIMITED')
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockRejectedValueOnce(rateLimitedError)

    await (baseClient as any)['checkAllowedOrigins']()

    expect(alertSpy).toHaveBeenCalledWith(
      ErrorUtil.ALERT_ERRORS.RATE_LIMITED_APP_CONFIGURATION,
      'error'
    )
  })

  it('should show SERVER_ERROR_APP_CONFIGURATION alert with error message for SERVER_ERROR', async () => {
    const originalError = new Error('Internal Server Error')
    const serverError = new Error('SERVER_ERROR')
    serverError.cause = originalError
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockRejectedValueOnce(serverError)

    await (baseClient as any)['checkAllowedOrigins']()

    expect(alertSpy).toHaveBeenCalledWith(
      {
        displayMessage: ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.displayMessage,
        debugMessage:
          ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.debugMessage(
            'Internal Server Error'
          )
      },
      'error'
    )
  })

  it('should show SERVER_ERROR_APP_CONFIGURATION alert with generic message when cause is not Error', async () => {
    const serverError = new Error('SERVER_ERROR')
    serverError.cause = 'not an error object'
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockRejectedValueOnce(serverError)

    await (baseClient as any)['checkAllowedOrigins']()

    expect(alertSpy).toHaveBeenCalledWith(
      {
        displayMessage: ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.displayMessage,
        debugMessage:
          ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.debugMessage('SERVER_ERROR')
      },
      'error'
    )
  })

  it('should not show any alert for unknown errors', async () => {
    const unknownError = new Error('UNKNOWN_ERROR')
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockRejectedValueOnce(unknownError)

    await (baseClient as any)['checkAllowedOrigins']()

    expect(alertSpy).not.toHaveBeenCalled()
  })

  it('should not show any alert for non-Error rejections', async () => {
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockRejectedValueOnce('string error' as any)

    await (baseClient as any)['checkAllowedOrigins']()

    expect(alertSpy).not.toHaveBeenCalled()
  })

  it('should show ORIGIN_NOT_ALLOWED alert when origin is not allowed', async () => {
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockResolvedValueOnce(['https://example.com'])
    vi.spyOn(WcHelpersUtil, 'isOriginAllowed').mockReturnValueOnce(false as any)
    vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValueOnce(true)

    await (baseClient as any)['checkAllowedOrigins']()

    expect(alertSpy).toHaveBeenCalledWith(ErrorUtil.ALERT_ERRORS.ORIGIN_NOT_ALLOWED, 'error')
  })

  it('should not show any alert when origin is allowed', async () => {
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockResolvedValueOnce(['https://example.com'])
    vi.spyOn(WcHelpersUtil, 'isOriginAllowed').mockReturnValueOnce(true as any)

    await (baseClient as any)['checkAllowedOrigins']()

    expect(alertSpy).not.toHaveBeenCalled()
  })
})

describe('AppKitBaseClient.connectWalletConnect', () => {
  let baseClient: AppKitBaseClient
  let closeSpy: any

  beforeEach(() => {
    vi.restoreAllMocks()

    baseClient = new (class extends AppKitBaseClient {
      constructor() {
        super({
          projectId: 'test-project-id',
          networks: [mainnet],
          adapters: [],
          sdkVersion: 'html-wagmi-1'
        })
      }

      async injectModalUi() {}
      async syncIdentity() {}

      override async syncAdapterConnections() {
        return Promise.resolve()
      }
    })()

    baseClient.remoteFeatures = { multiWallet: true }
    closeSpy = vi.spyOn(baseClient, 'close').mockImplementation(async () => {})

    const mockAdapter = {
      connectWalletConnect: vi.fn().mockResolvedValue({ clientId: 'test-client-id' })
    }

    vi.spyOn(baseClient as any, 'getAdapter').mockReturnValue(mockAdapter as any)
    vi.spyOn(baseClient, 'getCaipNetwork').mockReturnValue({ id: 1 } as any)
    mockChainControllerState({
      activeChain: ConstantsUtil.CHAIN.EVM,
      chains: new Map([[ConstantsUtil.CHAIN.EVM, {}]])
    })
  })

  it('should not call close when hasConnections is true and multiWallet is enabled', async () => {
    vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([
      { connectorId: 'existing-connector', accounts: [{ address: '0x123' }] }
    ])

    const connectionControllerClient = (baseClient as any).connectionControllerClient
    await connectionControllerClient.connectWalletConnect()

    expect(closeSpy).not.toHaveBeenCalled()
  })

  it('should call close when hasConnections is false', async () => {
    vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([])

    const connectionControllerClient = (baseClient as any).connectionControllerClient
    await connectionControllerClient.connectWalletConnect()

    expect(closeSpy).toHaveBeenCalled()
  })

  it('should call close when multiWallet is disabled even with existing connections', async () => {
    vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
      ...ConnectionController.state,
      connections: new Map([
        ['eip155', [{ connectorId: 'existing-connector', accounts: [{ address: '0x123' }] }]]
      ])
    })
    baseClient.remoteFeatures = { multiWallet: false }

    const connectionControllerClient = (baseClient as any).connectionControllerClient
    await connectionControllerClient.connectWalletConnect()

    expect(closeSpy).toHaveBeenCalled()
  })
})

describe('AppKitBaseClient.getCaipNetwork', () => {
  let baseClient: AppKitBaseClient

  beforeEach(() => {
    vi.restoreAllMocks()

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155',
      chains: new Map([
        [
          'eip155',
          {
            networkState: {
              requestedCaipNetworks: [mainnet],
              approvedCaipNetworkIds: [mainnet.id]
            }
          }
        ]
      ]) as Map<ChainNamespace, ChainAdapter>
    })

    baseClient = new (class extends AppKitBaseClient {
      constructor() {
        super({
          projectId: 'test-project-id',
          networks: [mainnet],
          adapters: [],
          sdkVersion: 'html-wagmi-1'
        })
      }

      async injectModalUi() {}
      async syncIdentity() {}

      override async syncAdapterConnections() {
        return Promise.resolve()
      }
    })()
  })

  it('should call ChainController.getCaipNetworks when chainNamespace is provided', () => {
    const getCaipNetworksSpy = vi.spyOn(ChainController, 'getCaipNetworks')
    const chainNamespace = 'eip155'

    baseClient.getCaipNetwork(chainNamespace)

    expect(getCaipNetworksSpy).toHaveBeenCalledWith(chainNamespace)
  })
})

describe('AppKitBaseClient.open', () => {
  let baseClient: AppKitBaseClient
  let fetchTokenImagesSpy: MockInstance
  let subscribeKeySpy: MockInstance
  let modalSubscribeSpy: MockInstance

  beforeEach(() => {
    vi.clearAllMocks()

    baseClient = new (class extends AppKitBaseClient {
      constructor() {
        super({
          projectId: 'test-project-id',
          networks: [mainnet],
          adapters: [],
          sdkVersion: 'html-wagmi-1'
        })
      }

      async injectModalUi() {}
      async syncIdentity() {}
      override async syncAdapterConnections() {
        return Promise.resolve()
      }
    })()

    vi.spyOn(ModalController, 'open').mockResolvedValue(undefined)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      chains: new Map([
        [
          'eip155',
          {
            accountState: {
              caipAddress: 'eip155:1:0x1234567890123456789012345678901234567890',
              activeCaipAddress: 'eip155:1:0x1234567890123456789012345678901234567890'
            }
          }
        ]
      ]) as unknown as Map<ChainNamespace, ChainAdapter>,
      activeCaipAddress: 'eip155:1:0x1234567890123456789012345678901234567890'
    })

    fetchTokenImagesSpy = vi.spyOn(ApiController, 'fetchTokenImages').mockResolvedValue(undefined)
    subscribeKeySpy = vi.spyOn(SendController, 'subscribeKey').mockReturnValue(() => {})
    modalSubscribeSpy = vi.spyOn(ModalController, 'subscribe').mockReturnValue(() => {})
  })

  it('should fetch token images when assetAddress is provided and symbol is found', async () => {
    const mockArgs = {
      assetAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      amount: '1.0',
      namespace: 'eip155' as ChainNamespace,
      chainId: '1',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    }
    vi.spyOn(TokenUtil, 'getTokenSymbolByAddress').mockReturnValue('USDC')

    subscribeKeySpy.mockImplementation((_key: any, callback: any) => {
      setTimeout(() => callback('0x123hash'), 0)
      return () => {}
    })

    const result = await baseClient.open({ view: 'WalletSend', arguments: mockArgs })

    expect(TokenUtil.getTokenSymbolByAddress).toHaveBeenCalledWith(mockArgs.assetAddress)
    expect(fetchTokenImagesSpy).toHaveBeenCalledWith(['USDC'])
    expect(ModalController.open).toHaveBeenCalledWith({
      view: 'WalletSend',
      data: { send: mockArgs }
    })
    expect(result).toEqual({ hash: '0x123hash' })
  })

  it('should not fetch token images when symbol is not found', async () => {
    const mockArgs = {
      assetAddress: '0xunknown',
      amount: '1.0',
      namespace: 'eip155' as ChainNamespace,
      chainId: '1',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    }
    vi.spyOn(TokenUtil, 'getTokenSymbolByAddress').mockReturnValue(undefined)

    subscribeKeySpy.mockImplementation((_key: any, callback: any) => {
      setTimeout(() => callback('0x123hash'), 0)
      return () => {}
    })

    await baseClient.open({ view: 'WalletSend', arguments: mockArgs })

    expect(TokenUtil.getTokenSymbolByAddress).toHaveBeenCalledWith(mockArgs.assetAddress)
    expect(fetchTokenImagesSpy).not.toHaveBeenCalled()
    expect(ModalController.open).toHaveBeenCalledWith({
      view: 'WalletSend',
      data: { send: mockArgs }
    })
  })

  it('should ignore errors when fetching token images fails', async () => {
    const mockArgs = {
      assetAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      amount: '1.0',
      namespace: 'eip155' as ChainNamespace,
      chainId: '1',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    }
    vi.spyOn(TokenUtil, 'getTokenSymbolByAddress').mockReturnValue('USDC')
    fetchTokenImagesSpy.mockRejectedValue(new Error('Fetch failed'))

    subscribeKeySpy.mockImplementation((_key: any, callback: any) => {
      setTimeout(() => callback('0x123hash'), 0)
      return () => {}
    })

    const result = await baseClient.open({ view: 'WalletSend', arguments: mockArgs })

    expect(TokenUtil.getTokenSymbolByAddress).toHaveBeenCalledWith(mockArgs.assetAddress)
    expect(fetchTokenImagesSpy).toHaveBeenCalledWith(['USDC'])
    expect(ModalController.open).toHaveBeenCalledWith({
      view: 'WalletSend',
      data: { send: mockArgs }
    })
    expect(result).toEqual({ hash: '0x123hash' })
  })

  it('should reject when modal is closed before transaction hash is received', async () => {
    const mockArgs = {
      assetAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      amount: '1.0',
      namespace: 'eip155' as ChainNamespace,
      chainId: '1',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    }
    vi.spyOn(TokenUtil, 'getTokenSymbolByAddress').mockReturnValue('USDC')

    modalSubscribeSpy.mockImplementation((callback: any) => {
      setTimeout(() => callback({ open: false }), 0)
      return () => {}
    })

    subscribeKeySpy.mockReturnValue(() => {})

    await expect(baseClient.open({ view: 'WalletSend', arguments: mockArgs })).rejects.toThrow(
      'Modal closed'
    )
  })

  it('should resolve with hash when SendController emits hash', async () => {
    const mockArgs = {
      assetAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      amount: '1.0',
      namespace: 'eip155' as ChainNamespace,
      chainId: '1',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    }
    vi.spyOn(TokenUtil, 'getTokenSymbolByAddress').mockReturnValue('USDC')

    subscribeKeySpy.mockImplementation((_key: any, callback: any) => {
      setTimeout(() => callback('0xabc123def456'), 0)
      return () => {}
    })

    modalSubscribeSpy.mockReturnValue(() => {})

    const result = await baseClient.open({ view: 'WalletSend', arguments: mockArgs })

    expect(result).toEqual({ hash: '0xabc123def456' })
  })

  it('it should throw an error if failed to switch network', async () => {
    const mockArgs = {
      assetAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      amount: '1.0',
      namespace: 'eip155' as ChainNamespace,
      chainId: '1',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    }
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155',
      activeCaipAddress: 'eip155:137:0x1234567890123456789012345678901234567890',
      chains: new Map([
        [
          'eip155',
          {
            accountState: {
              caipAddress: 'eip155:137:0x1234567890123456789012345678901234567890'
            }
          }
        ]
      ]) as unknown as Map<ChainNamespace, ChainAdapter>
    })

    vi.spyOn(baseClient as any, 'getCaipNetwork').mockReturnValue({ id: 137 } as CaipNetwork)
    vi.spyOn(ChainController, 'getCaipNetworkById').mockReturnValue({
      id: 1,
      chainNamespace: 'eip155'
    } as CaipNetwork)

    vi.spyOn(ChainController, 'switchActiveNetwork').mockRejectedValue(
      new Error('Failed to switch')
    )

    await expect(baseClient.open({ view: 'WalletSend', arguments: mockArgs })).rejects.toThrow(
      'Failed to switch'
    )
  })
})

describe('AppKitBaseClient.getDisabledCaipNetworks', () => {
  let baseClient: AppKitBaseClient

  beforeEach(() => {
    vi.clearAllMocks()

    baseClient = new (class extends AppKitBaseClient {
      constructor() {
        super({
          projectId: 'test-project-id',
          networks: [mainnet],
          adapters: [],
          sdkVersion: 'html-wagmi-1'
        })
      }

      async injectModalUi() {}
      async syncIdentity() {}
    })()
  })

  it('should return only disabled requested caipNetworks', () => {
    const approvedIds = ['eip155:1', 'solana:101'] as CaipNetworkId[]
    const requestedNetworks = [
      { id: 1, chainNamespace: 'eip155', caipNetworkId: 'eip155:1' },
      { id: 101, chainNamespace: 'solana', caipNetworkId: 'solana:101' },
      { id: 56, chainNamespace: 'eip155', caipNetworkId: 'eip155:56' }
    ] as unknown as CaipNetwork[]

    vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds').mockReturnValue(approvedIds)
    vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue(requestedNetworks)
    vi.spyOn(CoreHelperUtil, 'sortRequestedNetworks').mockReturnValue(requestedNetworks)

    const isDisabledMock = vi
      .spyOn(ChainController, 'isCaipNetworkDisabled')
      .mockImplementation(network => network.caipNetworkId === 'eip155:56')

    const result = baseClient.getDisabledCaipNetworks()

    expect(isDisabledMock).toHaveBeenCalled()
    expect(result).toHaveLength(1)
    expect(result[0]?.caipNetworkId).toBe('eip155:56')
  })
})

describe('AppKitBaseClient initialization', () => {
  let fetchRemoteFeaturesSpy: MockInstance

  beforeAll(() => {
    Object.defineProperty(globalThis, 'document', {
      value: {
        getElementsByTagName: vi.fn(),
        querySelector: vi.fn()
      },
      writable: true
    })

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: {
          readText: vi.fn(() => Promise.resolve(''))
        }
      },
      writable: true
    })

    Object.defineProperty(globalThis, 'window', {
      value: { location: { origin: '' } },
      writable: true
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    fetchRemoteFeaturesSpy = vi
      .spyOn(ConfigUtil, 'fetchRemoteFeatures')
      .mockResolvedValue({} as RemoteFeatures)
  })

  it('should not fetch remote config if using basic mode', async () => {
    new (class extends AppKitBaseClient {
      constructor() {
        super({
          projectId: 'test-project-id',
          networks: [mainnet],
          adapters: [],
          sdkVersion: 'html-wagmi-1',
          basic: true
        })
      }

      async injectModalUi() {}
      async syncIdentity() {}

      override async syncAdapterConnections() {
        return Promise.resolve()
      }
    })()

    await vi.waitFor(() => expect(fetchRemoteFeaturesSpy).not.toHaveBeenCalled())
  })

  it('should not fetch remote config if using manual WC control', async () => {
    new (class extends AppKitBaseClient {
      constructor() {
        super({
          projectId: 'test-project-id',
          networks: [mainnet],
          adapters: [],
          sdkVersion: 'html-wagmi-1',
          manualWCControl: true
        })
      }

      async injectModalUi() {}
      async syncIdentity() {}

      override async syncAdapterConnections() {
        return Promise.resolve()
      }
    })()

    await vi.waitFor(() => expect(fetchRemoteFeaturesSpy).not.toHaveBeenCalled())
  })

  it('should fetch remote config if not using basic or manual WC control', async () => {
    new (class extends AppKitBaseClient {
      constructor() {
        super({
          projectId: 'test-project-id',
          networks: [mainnet],
          adapters: [],
          sdkVersion: 'html-wagmi-1'
        })
      }

      async injectModalUi() {}
      async syncIdentity() {}

      override async syncAdapterConnections() {
        return Promise.resolve()
      }
    })()

    await vi.waitFor(() => expect(fetchRemoteFeaturesSpy).toHaveBeenCalled())
  })
})
