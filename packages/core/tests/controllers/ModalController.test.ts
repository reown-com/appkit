import { ModalController } from '../../index'
import { describe, it, expect } from 'vitest'

// -- Setup --------------------------------------------------------------------
const controller = new ModalController()

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should have valid default state', () => {
    expect(controller.state.open).toEqual(false)
  })

  it('should update state correctly on open()', () => {
    controller.open()
    expect(controller.state.open).toEqual(true)
  })

  it('should update state correctly on close()', () => {
    controller.close()
    expect(controller.state.open).toEqual(false)
  })
})
