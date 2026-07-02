import { describe, expect, it } from 'vitest'

import { PublicStateController } from '../../exports/index.js'

// -- Tests --------------------------------------------------------------------
describe('PublicStateController', () => {
  it('should have valid default state', () => {
    expect(PublicStateController.state).toEqual({
      loading: false,
      open: false,
      selectedNetworkId: undefined,
      activeChain: undefined,
      initialized: false
    })
  })

  it('should update state correctly on set()', () => {
    PublicStateController.set({ open: true })
    expect(PublicStateController.state).toEqual({
      loading: false,
      selectedNetworkId: undefined,
      activeChain: undefined,
      initialized: false,
      open: true
    })
    PublicStateController.set({ selectedNetworkId: 'eip155:1' })
    expect(PublicStateController.state).toEqual({
      loading: false,
      open: true,
      selectedNetworkId: 'eip155:1',
      activeChain: undefined,
      initialized: false
    })
  })
})
