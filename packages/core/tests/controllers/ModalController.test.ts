import { ModalController } from '../../index'
import { describe, it, expect } from 'vitest'

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should have valid default state', () => {
    expect(ModalController.state.open).toEqual(false)
  })

  it('should update state correctly on open()', () => {
    ModalController.open()
    expect(ModalController.state.open).toEqual(true)
  })

  it('should update state correctly on close()', () => {
    ModalController.close()
    expect(ModalController.state.open).toEqual(false)
  })
})
