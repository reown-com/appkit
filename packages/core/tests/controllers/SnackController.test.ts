import { describe, expect, it } from 'vitest'
import { SnackController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('SnackController', () => {
  it('should have valid default state', () => {
    expect(SnackController.state).toEqual({
      message: '',
      variant: 'success',
      open: false
    })
  })

  it('should update state correctly on showSuccess()', () => {
    SnackController.showSuccess('Success Msg')
    expect(SnackController.state).toEqual({
      message: 'Success Msg',
      variant: 'success',
      open: true
    })
  })

  it('should update state correctly on hide()', () => {
    SnackController.hide()
    expect(SnackController.state).toEqual({
      message: 'Success Msg',
      variant: 'success',
      open: false
    })
  })

  it('should update state correctly on showError()', () => {
    SnackController.showError('Error Msg')
    expect(SnackController.state).toEqual({
      message: 'Error Msg',
      variant: 'error',
      open: true
    })
  })
})
