import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AlertController } from '@reown/appkit-controllers'
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

describe('AppKit error handling for api.web3modal.org/origins', () => {
  let alertSpy: any

  beforeEach(() => {
    alertSpy = vi.mocked(AlertController.open)
    alertSpy.mockReset()
  })

  async function handleApiError(error: unknown) {
    if (error instanceof Error) {
      const errorHandlers: Record<string, () => void> = {
        RATE_LIMITED: () => {
          AlertController.open(ErrorUtil.ALERT_ERRORS.RATE_LIMITED_APP_CONFIGURATION, 'error')
        },
        SERVER_ERROR: () => {
          const originalError = (error as any).cause instanceof Error ? (error as any).cause : error
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

  it('should show RATE_LIMITED_APP_CONFIGURATION alert for RATE_LIMITED error', async () => {
    const rateLimitedError = new Error('RATE_LIMITED')
    await handleApiError(rateLimitedError)

    expect(alertSpy).toHaveBeenCalledWith(
      ErrorUtil.ALERT_ERRORS.RATE_LIMITED_APP_CONFIGURATION,
      'error'
    )
  })

  it('should show SERVER_ERROR_APP_CONFIGURATION alert with error message for SERVER_ERROR', async () => {
    const originalError = new Error('Internal Server Error')
    const serverError = new Error('SERVER_ERROR') as Error & { cause?: unknown }
    serverError.cause = originalError
    await handleApiError(serverError)

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
    const serverError = new Error('SERVER_ERROR') as Error & { cause?: unknown }
    serverError.cause = 'not an error object'
    await handleApiError(serverError)

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
    await handleApiError(unknownError)

    expect(alertSpy).toHaveBeenCalledWith(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')
  })

  it('should show PROJECT_ID_NOT_CONFIGURED alert for non-Error objects', async () => {
    await handleApiError('string error')

    expect(alertSpy).toHaveBeenCalledWith(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')
  })
})
