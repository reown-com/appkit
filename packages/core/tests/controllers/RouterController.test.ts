import { RouterController } from '../../index'
import { describe, it, expect } from 'vitest'

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should have valid default state', () => {
    expect(RouterController.state).toEqual({
      view: 'Connect',
      history: ['Connect']
    })
  })

  it('should update state correctly on push()', () => {
    RouterController.push('Account')
    expect(RouterController.state).toEqual({
      view: 'Account',
      history: ['Connect', 'Account']
    })
  })

  it('should not update state when push() is called with the same view', () => {
    RouterController.push('Account')
    expect(RouterController.state).toEqual({
      view: 'Account',
      history: ['Connect', 'Account']
    })
  })

  it('should update state correctly on goBack()', () => {
    RouterController.goBack()
    expect(RouterController.state).toEqual({
      view: 'Connect',
      history: ['Connect']
    })
  })

  it('should not update state when goBack() is called with only one view in history', () => {
    RouterController.goBack()
    expect(RouterController.state).toEqual({
      view: 'Connect',
      history: ['Connect']
    })
  })

  it('should update state correctly on reset()', () => {
    RouterController.reset('Account')
    expect(RouterController.state).toEqual({
      view: 'Account',
      history: ['Account']
    })
  })

  it('should update state correctly on replace()', () => {
    RouterController.push('Connect')
    RouterController.replace('Networks')
    expect(RouterController.state).toEqual({
      view: 'Networks',
      history: ['Account', 'Networks']
    })
  })
})
