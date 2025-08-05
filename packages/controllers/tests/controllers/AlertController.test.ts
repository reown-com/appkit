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

  it('should show error code', () => {
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
})
