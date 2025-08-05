import { describe, expect, it, vi } from 'vitest'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

import {
  AlertController,
  ChainController,
  EventsController,
  FetchUtil
} from '../../exports/index.js'

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

  it('should trigger an alert error if the analytics event fails with a forbidden status', async () => {
    const error = new Error('forbidden')
    error.cause = new Response(null, {
      status: ConstantsUtil.HTTP_STATUS_CODES.FORBIDDEN
    })

    vi.spyOn(AlertController, 'open')
    vi.spyOn(FetchUtil.prototype, 'post').mockRejectedValue(error)

    await EventsController._sendAnalyticsEvent({
      ...EventsController.state,
      data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
    })

    expect(AlertController.open).toHaveBeenCalledWith(
      {
        displayMessage: 'Invalid App Configuration',
        debugMessage: expect.stringContaining('not found on Allowlist')
      },
      'error'
    )

    expect(EventsController.state.reportedErrors['FORBIDDEN']).toBe(true)
  })

  it('should include sdk properties when sending an analytics event', async () => {
    vi.spyOn(FetchUtil.prototype, 'post').mockResolvedValue({})

    await EventsController._sendAnalyticsEvent({
      ...EventsController.state,
      data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
    })

    expect(FetchUtil.prototype.post).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/e',
        params: EventsController.getSdkProperties()
      })
    )
  })

  it('should include caipNetworkId when sending an analytics event', async () => {
    vi.spyOn(FetchUtil.prototype, 'post').mockResolvedValue({})
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue({
      caipNetworkId: 'eip155:1'
    } as unknown as CaipNetwork)

    await EventsController._sendAnalyticsEvent({
      ...EventsController.state,
      data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
    })

    expect(FetchUtil.prototype.post).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/e',
        params: EventsController.getSdkProperties(),
        body: expect.objectContaining({
          props: expect.objectContaining({
            properties: expect.objectContaining({
              caipNetworkId: 'eip155:1'
            })
          })
        })
      })
    )
  })
})
