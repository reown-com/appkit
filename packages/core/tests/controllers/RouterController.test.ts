import { RouterController } from '../../index'
import { describe, it, expect } from 'vitest'

const controller = new RouterController()

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
})
