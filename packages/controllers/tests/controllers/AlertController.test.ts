import { describe, expect, it } from 'vitest'

import { AlertController, OptionsController } from '../../exports/index.js'

// -- Setup --------------------------------------------------------------------
OptionsController.state.debug = true

// -- Tests --------------------------------------------------------------------
describe('AlertController', () => {
  it('should show info state', () => {
    AlertController.open({ shortMessage: 'Info message' }, 'info')
    expect(AlertController.state).toStrictEqual({
      message: 'Info message',
      variant: 'info',
      open: true
    })
  })

  it('should show success state', () => {
    AlertController.open({ shortMessage: 'Success message' }, 'success')
    expect(AlertController.state).toStrictEqual({
      message: 'Success message',
      variant: 'success',
      open: true
    })
  })

  it('should show warning state', () => {
    AlertController.open({ shortMessage: 'Warning message' }, 'warning')
    expect(AlertController.state).toStrictEqual({
      message: 'Warning message',
      variant: 'warning',
      open: true
    })
  })

  it('should show error state', () => {
    AlertController.open({ shortMessage: 'Error message' }, 'error')
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
})
