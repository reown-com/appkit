import { describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import { EventsController, ModalController, PublicStateController } from '../../exports/index.js'
import { ConnectionController } from '../../exports/index.js'
import { ChainController } from '../../exports/index.js'
import { RouterController } from '../../exports/index.js'

// -- Mock --------------------------------------------------------------------

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should have valid default state', () => {
    expect(ModalController.state.open).toEqual(false)
  })

  // Skipping for now, need to figure out a way to test this with new prefetch check
  it('should update state correctly on open()', async () => {
    const eventsControllerSpy = vi.spyOn(EventsController, 'sendEvent')
    const routerControllerSpy = vi.spyOn(RouterController, 'reset')
    const publicStateControllerSpy = vi.spyOn(PublicStateController, 'set')

    vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
      ...ConnectionController.state,
      wcBasic: false
    })

    await ModalController.open()

    expect(ModalController.state.open).toEqual(true)
    expect(eventsControllerSpy).toHaveBeenCalled()
    expect(routerControllerSpy).toHaveBeenCalled()
    expect(publicStateControllerSpy).toHaveBeenCalled()
  })

  it('should update state correctly on close()', () => {
    ModalController.close()
    expect(ModalController.state.open).toEqual(false)
  })

  it('should not open modal when wcBasic is true and user is connected', async () => {
    const eventsControllerSpy = vi.spyOn(EventsController, 'sendEvent')
    const routerControllerSpy = vi.spyOn(RouterController, 'reset')
    const publicStateControllerSpy = vi.spyOn(PublicStateController, 'set')
    vi.spyOn(ConnectionController.state, 'wcBasic', 'get').mockReturnValue(true)
    vi.spyOn(ChainController.state, 'activeCaipAddress', 'get').mockReturnValue('eip155:1:0x123...')

    await ModalController.open()

    expect(ModalController.state.open).toBe(false)
    expect(RouterController.state.view).not.toBe('Account')
    expect(eventsControllerSpy).not.toHaveBeenCalled()
    expect(routerControllerSpy).not.toHaveBeenCalled()
    expect(publicStateControllerSpy).not.toHaveBeenCalled()

    vi.spyOn(ConnectionController.state, 'wcBasic', 'get').mockReturnValue(false)
    vi.spyOn(ChainController.state, 'activeCaipAddress', 'get').mockReturnValue(undefined)
  })
})
