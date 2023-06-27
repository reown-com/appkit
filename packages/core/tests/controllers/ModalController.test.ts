import { ModalController } from '../../index'
import { describe, it, expect } from 'vitest'

const controller = new ModalController()

describe('ModalController', () => {
  it('should have valid default state', () => {
    expect(controller.state.open).toBe(false)
  })

  it('should update state correctly on open()', () => {
    controller.open()
    expect(controller.state.open).toBe(true)
  })

  it('should update state correctly on close()', () => {
    controller.close()
    expect(controller.state.open).toBe(false)
  })
})
