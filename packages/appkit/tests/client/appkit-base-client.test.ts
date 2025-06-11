import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AlertController, ApiController } from '@reown/appkit-controllers'
import { ErrorUtil } from '@reown/appkit-utils'

vi.mock('@reown/appkit-controllers', async () => {
  const actual = await vi.importActual('@reown/appkit-controllers')
  return {
    ...actual,
    AlertController: {
      open: vi.fn()
    }
  }
})

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
    alertSpy = vi.mocked(AlertController.open)
    alertSpy.mockReset()
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
