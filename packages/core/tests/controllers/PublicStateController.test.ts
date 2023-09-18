import { describe, expect, it } from 'vitest'
import { PublicStateController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('PublicStateController', () => {
  it('should have valid default state', () => {
    expect(PublicStateController.state).toEqual({
      open: false,
      selectedNetworkId: undefined
    })
  })

  it('should update state correctly on set()', () => {
    PublicStateController.set({ open: true })
    expect(PublicStateController.state).toEqual({
      open: true,
      selectedNetworkId: undefined
    })
    PublicStateController.set({ selectedNetworkId: 'eip155:1' })
    expect(PublicStateController.state).toEqual({
      open: true,
      selectedNetworkId: 'eip155:1'
    })
  })
})
