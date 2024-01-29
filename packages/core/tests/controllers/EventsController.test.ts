import { describe, expect, it } from 'vitest'
import { EventsController } from '../../index.js'

// -- Setup --------------------------------------------------------------------
const event = { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } } as const

// -- Tests --------------------------------------------------------------------

describe('EventsController', () => {
  it('should have valid default state', () => {
    expect(EventsController.state.data).toEqual({
      type: 'track',
      event: 'MODAL_CREATED'
    })
  })

  it('should update state correctly on sendEvent()', () => {
    EventsController.sendEvent(event)
    expect(EventsController.state.data).toEqual(event)
  })
})
