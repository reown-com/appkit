import { ModalController } from '../../index'
import { describe, it, expect } from 'vitest'

const controller = new ModalController()

describe('ModalController', () => {
  it('should have default state.open = false', () => {
    expect(controller.state.open).toBe(false)
  })

  it('should set state.open = true when open()', () => {
    controller.open()
    expect(controller.state.open).toBe(true)
  })

  it('should set state.open = false when close()', () => {
    controller.close()
    expect(controller.state.open).toBe(false)
  })
})
