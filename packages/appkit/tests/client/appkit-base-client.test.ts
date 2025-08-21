import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import type { ChainNamespace } from '@reown/appkit-common'
import {
  AlertController,
  ApiController,
  type ChainAdapter,
  ChainController,
  ConnectionController,
  CoreHelperUtil
} from '@reown/appkit-controllers'
import { mockChainControllerState } from '@reown/appkit-controllers/testing'
import { ErrorUtil } from '@reown/appkit-utils'

import { AppKitBaseClient } from '../../src/client/appkit-base-client'
import { WcHelpersUtil } from '../../src/utils/index'
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
    })()
  })

  it('should call ChainController.getCaipNetworks when chainNamespace is provided', () => {
    const getCaipNetworksSpy = vi.spyOn(ChainController, 'getCaipNetworks')
    const chainNamespace = 'eip155'

    baseClient.getCaipNetwork(chainNamespace)

    expect(getCaipNetworksSpy).toHaveBeenCalledWith(chainNamespace)
  })
})
