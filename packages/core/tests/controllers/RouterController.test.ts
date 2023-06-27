import { RouterController } from '../../index'
import { describe, it, expect } from 'vitest'

// -- Setup --------------------------------------------------------------------
const controller = new RouterController()

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should have valid default state', () => {
    expect(controller.state).toEqual({
      view: 'Connect',
      history: ['Connect']
    })
  })

  it('should update state correctly on push()', () => {
    controller.push('Account')
    expect(controller.state).toEqual({
      view: 'Account',
      history: ['Connect', 'Account']
    })
  })

  it('should not update state when push() is called with the same view', () => {
    controller.push('Account')
    expect(controller.state).toEqual({
      view: 'Account',
      history: ['Connect', 'Account']
    })
  })

  it('should update state correctly on goBack()', () => {
    controller.goBack()
    expect(controller.state).toEqual({
      view: 'Connect',
      history: ['Connect']
    })
  })

  it('should not update state when goBack() is called with only one view in history', () => {
    controller.goBack()
    expect(controller.state).toEqual({
      view: 'Connect',
      history: ['Connect']
    })
  })

  it('should update state correctly on reset()', () => {
    controller.reset('Account')
    expect(controller.state).toEqual({
      view: 'Account',
      history: ['Account']
    })
  })

  it('should update state correctly on replace()', () => {
    controller.push('Connect')
    controller.replace('Networks')
    expect(controller.state).toEqual({
      view: 'Networks',
      history: ['Account', 'Networks']
    })
  })
})
