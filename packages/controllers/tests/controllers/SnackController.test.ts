import { describe, expect, it, vi } from 'vitest'

import { SnackController } from '../../exports/index.js'

vi.useFakeTimers()

const SHOW_MESSAGE_TIMEOUT = 150

// -- Tests --------------------------------------------------------------------
describe('SnackController', () => {
  it('should have valid default state', () => {
    expect(SnackController.state).toEqual({
      autoClose: true,
      message: '',
      variant: 'success',
      svg: undefined,
      open: false
    })
  })

  it('should update state correctly on showSuccess()', () => {
    SnackController.showSuccess('Success Msg')
    vi.advanceTimersByTime(SHOW_MESSAGE_TIMEOUT)
    expect(SnackController.state).toEqual({
      autoClose: true,
      message: 'Success Msg',
      variant: 'success',
      svg: undefined,
      open: true
    })
  })

  it('should update state correctly on hide()', () => {
    SnackController.hide()
    expect(SnackController.state).toEqual({
      message: '',
      variant: 'success',
      svg: undefined,
      open: false,
      autoClose: true
    })
  })

  it('should update state correctly on showError()', () => {
    SnackController.showError('Error Msg')
    vi.advanceTimersByTime(SHOW_MESSAGE_TIMEOUT)
    expect(SnackController.state).toEqual({
      autoClose: true,
      message: 'Error Msg',
      variant: 'error',
      svg: undefined,
      open: true
    })
  })

  it('should update state correctly on showSvg()', async () => {
    const svg = {
      iconColor: 'accent-100',
      icon: 'checkmark'
    }
    SnackController.showSvg('Svg Msg', svg)
    vi.advanceTimersByTime(SHOW_MESSAGE_TIMEOUT)
    expect(SnackController.state).toEqual({
      autoClose: true,
      message: 'Svg Msg',
      variant: 'success',
      svg,
      open: true
    })
  })

  it('should update state correctly on showLoading() with autoClose false', () => {
    SnackController.showLoading('Loading Msg', { autoClose: false })
    vi.advanceTimersByTime(SHOW_MESSAGE_TIMEOUT)
    expect(SnackController.state).toEqual({
      autoClose: false,
      message: 'Loading Msg',
      variant: 'loading',
      svg: undefined,
      open: true
    })
  })

  it('should update state correctly on showLoading() with autoClose true', () => {
    SnackController.showLoading('Loading Msg')
    vi.advanceTimersByTime(SHOW_MESSAGE_TIMEOUT)
    expect(SnackController.state).toEqual({
      autoClose: true,
      message: 'Loading Msg',
      variant: 'loading',
      svg: undefined,
      open: true
    })
  })
})
