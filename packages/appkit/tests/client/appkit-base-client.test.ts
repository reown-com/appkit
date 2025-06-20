import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AlertController,
  ApiController,
  ChainController,
  ConnectionController
} from '@reown/appkit-controllers'
import { ErrorUtil } from '@reown/appkit-utils'

import { AppKitBaseClient } from '../../src/client/appkit-base-client'
import { mainnet } from '../mocks/Networks'

class TestAppKitBaseClient {
  async checkAllowedOrigins() {
    try {
      const allowedOrigins = await ApiController.fetchAllowedOrigins()
      if (!allowedOrigins) {
        AlertController.open(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorHandlers: Record<string, () => void> = {
          RATE_LIMITED: () => {
            AlertController.open(ErrorUtil.ALERT_ERRORS.RATE_LIMITED_APP_CONFIGURATION, 'error')
          },
          SERVER_ERROR: () => {
            const originalError = error.cause instanceof Error ? error.cause : error
            AlertController.open(
              {
                shortMessage: ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.shortMessage,
                longMessage: ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.longMessage(
                  originalError.message
                )
              },
              'error'
            )
          }
        }

        const handler = errorHandlers[error.message]
        if (handler) {
          handler()
        } else {
          AlertController.open(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')
        }
      } else {
        AlertController.open(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')
      }
    }
  }
}

describe('AppKitBaseClient.checkAllowedOrigins', () => {
  let client: TestAppKitBaseClient
  let alertSpy: any

  beforeEach(() => {
    client = new TestAppKitBaseClient()
    alertSpy = vi.spyOn(AlertController, 'open').mockImplementation(() => {})
  })

  it('should show RATE_LIMITED_APP_CONFIGURATION alert for RATE_LIMITED error', async () => {
    const rateLimitedError = new Error('RATE_LIMITED')
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockRejectedValueOnce(rateLimitedError)

    await client['checkAllowedOrigins']()

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

    await client['checkAllowedOrigins']()

    expect(alertSpy).toHaveBeenCalledWith(
      {
        shortMessage: ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.shortMessage,
        longMessage:
          ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.longMessage('Internal Server Error')
      },
      'error'
    )
  })

  it('should show SERVER_ERROR_APP_CONFIGURATION alert with generic message when cause is not Error', async () => {
    const serverError = new Error('SERVER_ERROR')
    serverError.cause = 'not an error object'
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockRejectedValueOnce(serverError)

    await client['checkAllowedOrigins']()

    expect(alertSpy).toHaveBeenCalledWith(
      {
        shortMessage: ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.shortMessage,
        longMessage:
          ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.longMessage('SERVER_ERROR')
      },
      'error'
    )
  })

  it('should show PROJECT_ID_NOT_CONFIGURED alert for unknown errors', async () => {
    const unknownError = new Error('UNKNOWN_ERROR')
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockRejectedValueOnce(unknownError)

    await client['checkAllowedOrigins']()

    expect(alertSpy).toHaveBeenCalledWith(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')
  })

  it('should show PROJECT_ID_NOT_CONFIGURED alert for non-Error objects', async () => {
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockRejectedValueOnce('string error')

    await client['checkAllowedOrigins']()

    expect(alertSpy).toHaveBeenCalledWith(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')
  })
})

describe('AppKitBaseClient.connectWalletConnect', () => {
  let baseClient: AppKitBaseClient
  let closeSpy: any

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

    baseClient.remoteFeatures = { multiWallet: true }
    closeSpy = vi.spyOn(baseClient, 'close').mockImplementation(async () => {})

    const mockAdapter = {
      connectWalletConnect: vi.fn().mockResolvedValue({ clientId: 'test-client-id' })
    }

    vi.spyOn(baseClient as any, 'getAdapter').mockReturnValue(mockAdapter as any)
    vi.spyOn(baseClient, 'getCaipNetwork').mockReturnValue({ id: 1 } as any)
  })

  it('should not call close when hasConnections is true and multiWallet is enabled', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155',
      chains: new Map([['eip155', {}]])
    })
    vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([
      { connectorId: 'existing-connector', accounts: [{ address: '0x123' }] }
    ])

    const connectionControllerClient = (baseClient as any).connectionControllerClient
    await connectionControllerClient.connectWalletConnect()

    expect(closeSpy).not.toHaveBeenCalled()
  })

  it('should call close when hasConnections is false', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155',
      chains: new Map([['eip155', {}]])
    })
    vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([])

    const connectionControllerClient = (baseClient as any).connectionControllerClient
    await connectionControllerClient.connectWalletConnect()

    expect(closeSpy).toHaveBeenCalled()
  })

  it('should call close when multiWallet is disabled even with existing connections', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155',
      chains: new Map([['eip155', {}]])
    })
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
