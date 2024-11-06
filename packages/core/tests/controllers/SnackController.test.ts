import { describe, expect, it } from 'vitest'
import { SnackController } from '../../exports/index.js'

// -- Tests --------------------------------------------------------------------
describe('SnackController', () => {
  it('should have valid default state', () => {
    expect(SnackController.state).toEqual({
      message: '',
      variant: 'success',
      icon: undefined,
      open: false
    })
  })

  it('should update state correctly on showSuccess()', () => {
    SnackController.showSuccess('Success Msg')
    expect(SnackController.state).toEqual({
      message: 'Success Msg',
      variant: 'success',
      icon: undefined,
      open: true
    })
  })

  it('should update state correctly on hide()', () => {
    SnackController.hide()
    expect(SnackController.state).toEqual({
      message: 'Success Msg',
      variant: 'success',
      icon: undefined,
      open: false
    })
  })

  it('should update state correctly on showError()', () => {
    SnackController.showError('Error Msg')
    expect(SnackController.state).toEqual({
      message: 'Error Msg',
      variant: 'error',
      icon: undefined,
      open: true
    })
  })

  it('should update state correctly on showSvg()', async () => {
    const icon = {
      backgroundColor: 'accent-100',
      iconColor: 'accent-100',
      icon: 'checkmark'
    }
    SnackController.hide()
    SnackController.showSvg('Svg Msg', icon)
    expect(SnackController.state).toEqual({
      message: 'Svg Msg',
      variant: 'success',
      icon,
      open: true
    })
  })
})
