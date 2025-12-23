import { afterEach, describe, expect, it, vi } from 'vitest'

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

  it('should use console.error for error variant with debug message', () => {
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

  it('should use console.warn for warning variant with debug message', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    AlertController.open(
      {
        code: 'APKT006',
        displayMessage: 'Config Notice',
        debugMessage: '[Reown Config Notice] Configuration has been overridden by remote config.'
      },
      'warning'
    )
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Reown Config Notice] Configuration has been overridden by remote config.',
      { code: 'APKT006' }
    )
  })

  it('should use console.log for info variant with debug message', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    AlertController.open(
      {
        debugMessage: 'Info debug message'
      },
      'info'
    )
    expect(consoleLogSpy).toHaveBeenCalledWith('Info debug message', undefined)
  })

  it('should use console.log for success variant with debug message', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    AlertController.open(
      {
        debugMessage: 'Success debug message'
      },
      'success'
    )
    expect(consoleLogSpy).toHaveBeenCalledWith('Success debug message', undefined)
  })

  it('should not log to console when debug mode is disabled', () => {
    OptionsController.state.debug = false
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    AlertController.open(
      {
        debugMessage: 'This should not be logged'
      },
      'error'
    )

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
    expect(consoleLogSpy).not.toHaveBeenCalled()

    // Restore debug mode for other tests
    OptionsController.state.debug = true
  })

  it('should handle function debug message', () => {
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
