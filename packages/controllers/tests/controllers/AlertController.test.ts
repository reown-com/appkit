import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

import { AlertController, OptionsController } from '../../exports/index.js'

// -- Setup --------------------------------------------------------------------
OptionsController.state.debug = true

// -- Tests --------------------------------------------------------------------
describe('AlertController', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should show info state', () => {
    AlertController.open({ displayMessage: 'Info message' }, 'info')
    expect(AlertController.state).toStrictEqual({
      message: 'Info message',
      variant: 'info',
      open: true
    })
  })

  it('should show success state', () => {
    AlertController.open({ displayMessage: 'Success message' }, 'success')
    expect(AlertController.state).toStrictEqual({
      message: 'Success message',
      variant: 'success',
      open: true
    })
  })

  it('should show warning state', () => {
    AlertController.open({ displayMessage: 'Warning message' }, 'warning')
    expect(AlertController.state).toStrictEqual({
      message: 'Warning message',
      variant: 'warning',
      open: true
    })
  })

  it('should show error state', () => {
    AlertController.open({ displayMessage: 'Error message' }, 'error')
    expect(AlertController.state).toStrictEqual({
      message: 'Error message',
      variant: 'error',
      open: true
    })
  })

  it('should reset state on close', () => {
    AlertController.close()
    expect(AlertController.state).toStrictEqual({
      message: '',
      variant: 'info',
      open: false
    })
  })

  describe('console logging', () => {
    let isDevelopmentMock: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      isDevelopmentMock = vi
        .spyOn(CommonConstantsUtil, 'IS_DEVELOPMENT', 'get')
        .mockReturnValue(true)
    })

    afterEach(() => {
      isDevelopmentMock.mockRestore()
    })

    it('should use console.error for error variant in development', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      AlertController.open(
        {
          code: 'APKT005',
          displayMessage: 'Unverified Domain',
          debugMessage:
            'Embedded wallet load failed. Ensure your domain is verified in https://dashboard.reown.com.'
        },
        'error'
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Embedded wallet load failed. Ensure your domain is verified in https://dashboard.reown.com.',
        { code: 'APKT005' }
      )
    })

    it('should use console.warn for warning variant in development', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      AlertController.open(
        {
          debugMessage: 'This is a warning message'
        },
        'warning'
      )
      expect(consoleWarnSpy).toHaveBeenCalledWith('This is a warning message', undefined)
    })

    it('should use console.info for info variant in development', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      AlertController.open(
        {
          debugMessage: 'This is an info message'
        },
        'info'
      )
      expect(consoleInfoSpy).toHaveBeenCalledWith('This is an info message', undefined)
    })

    it('should use console.info for success variant in development', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      AlertController.open(
        {
          debugMessage: 'This is a success message'
        },
        'success'
      )
      expect(consoleInfoSpy).toHaveBeenCalledWith('This is a success message', undefined)
    })

    it('should not log to console in production', () => {
      isDevelopmentMock.mockReturnValue(false)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      AlertController.open(
        {
          debugMessage: 'This should not be logged'
        },
        'error'
      )

      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })

    it('should handle function debugMessage in development', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const debugMessageFn = () => 'Dynamic error message'
      AlertController.open(
        {
          debugMessage: debugMessageFn
        },
        'error'
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('Dynamic error message', undefined)
    })
  })
})
