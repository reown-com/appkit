import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type CaipNetwork } from '@reown/appkit-common'

import { ChainController, EventsController, FetchUtil } from '../../exports/index.js'

// -- Setup --------------------------------------------------------------------
const event = { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } } as const

// -- Tests --------------------------------------------------------------------

describe('EventsController', () => {
  beforeEach(() => {
    // Mock the document object
    let eventsAndCallbacks = new Map<string, () => void>()
    const addEventListener = function (event: string, callback: () => void) {
      eventsAndCallbacks.set(event, callback)
    }
    globalThis.document = {
      ...globalThis.document,
      addEventListener: addEventListener,
      dispatchEvent: (event: Event) => {
        eventsAndCallbacks.get(event.type)?.()
      },
      visibilityState: 'hidden'
    } as unknown as Document

    // Reset the state
    EventsController.state.pendingEvents = []
    EventsController.state.subscribedToVisibilityChange = false
  })

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

  it('should subscribe to visibilitychange only once', () => {
    const original = document.addEventListener
    const mock = vi.fn()
    ;(document as any).addEventListener = mock
    for (let i = 0; i < 10; i++) {
      EventsController._subscribeToVisibilityChange()
    }
    expect(mock).toHaveBeenCalledTimes(1)

    expect(mock).toHaveBeenCalledExactlyOnceWith('visibilitychange', expect.any(Function))
    expect(EventsController.state.subscribedToVisibilityChange).toEqual(true)
    ;(document as any).addEventListener = original
  })

  it('should set pending events', async () => {
    EventsController._setPendingEvent({
      ...EventsController.state,
      data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
    })

    expect(EventsController.state.pendingEvents).toEqual([
      {
        eventId: expect.any(String),
        url: expect.any(String),
        domain: expect.any(String),
        timestamp: expect.any(Number),
        props: expect.objectContaining({
          type: 'track',
          event: 'MODAL_CLOSE',
          properties: { connected: true }
        })
      }
    ])
  })

  it('should set multiple pending events', async () => {
    const numEvents = 50
    for (let i = 0; i < numEvents; i++) {
      EventsController._setPendingEvent({
        ...EventsController.state,
        data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
      })
    }

    expect(EventsController.state.pendingEvents.length).toEqual(numEvents)
  })

  it('should submit pending events', async () => {
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)

    EventsController._setPendingEvent({
      ...EventsController.state,
      data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
    })

    expect(EventsController.state.pendingEvents).toEqual([
      {
        eventId: expect.any(String),
        url: expect.any(String),
        domain: expect.any(String),
        timestamp: expect.any(Number),
        props: expect.objectContaining({
          type: 'track',
          event: 'MODAL_CLOSE',
          properties: { connected: true }
        })
      }
    ])

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true
    })
    document.dispatchEvent(new Event('visibilitychange'))
    EventsController._submitPendingEvents()
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        path: '/batch',
        params: EventsController.getSdkProperties()
      })
    )

    expect(EventsController.state.pendingEvents).toEqual([])
  })

  it('should automatically submit pending events when KB limit is reached', async () => {
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)

    // each test event is approx 0.2KB so we need ~222 events to reach the current KB limit of 45KB (MAX_PENDING_EVENTS_KB)
    const numEvents = 225 // 222 events should be processed and 3 should be present after the auto submit
    for (let i = 0; i < numEvents; i++) {
      EventsController._setPendingEvent({
        ...EventsController.state,
        data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
      })
    }

    // the events should be automatically submitted when the KB limit is reached
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        path: '/batch',
        params: EventsController.getSdkProperties()
      })
    )
    expect(EventsController.state.pendingEvents.length).toEqual(3)
  })

  it('should submit pending events on visibilitychange', async () => {
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)

    EventsController.sendEvent(event)

    expect(EventsController.state.pendingEvents).toEqual([
      {
        eventId: expect.any(String),
        url: expect.any(String),
        domain: expect.any(String),
        timestamp: expect.any(Number),
        props: expect.objectContaining({
          type: 'track',
          event: 'MODAL_CLOSE',
          properties: { connected: true }
        })
      }
    ])

    // mimic visibilitychange state
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true
    })

    document.dispatchEvent(new Event('visibilitychange'))

    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        path: '/batch',
        params: EventsController.getSdkProperties(),
        body: expect.arrayContaining([
          expect.objectContaining({
            props: expect.objectContaining({
              type: 'track',
              event: 'MODAL_CLOSE',
              properties: { connected: true }
            })
          })
        ])
      })
    )

    expect(EventsController.state.pendingEvents).toEqual([])
  })

  it('should not submit pending events on visibilitychange: visible', async () => {
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)

    EventsController.sendEvent(event)

    expect(EventsController.state.pendingEvents).toEqual([
      {
        eventId: expect.any(String),
        url: expect.any(String),
        domain: expect.any(String),
        timestamp: expect.any(Number),
        props: expect.objectContaining({
          type: 'track',
          event: 'MODAL_CLOSE',
          properties: { connected: true }
        })
      }
    ])

    // mimic visibilitychange state
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true
    })

    document.dispatchEvent(new Event('visibilitychange'))

    expect(FetchUtil.prototype.sendBeacon).not.toHaveBeenCalled()
  })

  it('should not submit empty pending events array on visibilitychange', async () => {
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)

    // mimic visibilitychange state
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true
    })

    document.dispatchEvent(new Event('visibilitychange'))

    expect(FetchUtil.prototype.sendBeacon).not.toHaveBeenCalled()
  })

  it('should not submit pending events on visibilitychange multiple times', async () => {
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)

    EventsController.sendEvent(event)

    expect(EventsController.state.pendingEvents).toEqual([
      {
        eventId: expect.any(String),
        url: expect.any(String),
        domain: expect.any(String),
        timestamp: expect.any(Number),
        props: expect.objectContaining({
          type: 'track',
          event: 'MODAL_CLOSE',
          properties: { connected: true }
        })
      }
    ])

    // mimic visibilitychange state
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true
    })

    document.dispatchEvent(new Event('visibilitychange'))

    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        path: '/batch',
        params: EventsController.getSdkProperties(),
        body: expect.arrayContaining([
          expect.objectContaining({
            props: expect.objectContaining({
              type: 'track',
              event: 'MODAL_CLOSE',
              properties: { connected: true }
            })
          })
        ])
      })
    )

    expect(EventsController.state.pendingEvents).toEqual([])

    EventsController.sendEvent(event)

    expect(EventsController.state.pendingEvents).toEqual([
      {
        eventId: expect.any(String),
        url: expect.any(String),
        domain: expect.any(String),
        timestamp: expect.any(Number),
        props: expect.objectContaining({
          type: 'track',
          event: 'MODAL_CLOSE',
          properties: { connected: true }
        })
      }
    ])

    document.dispatchEvent(new Event('visibilitychange'))

    expect(FetchUtil.prototype.sendBeacon).toBeCalledTimes(2)
  })

  it('should include caipNetworkId when sending an analytics event', async () => {
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue({
      caipNetworkId: 'eip155:1'
    } as unknown as CaipNetwork)

    EventsController._setPendingEvent({
      ...EventsController.state,
      data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
    })
    EventsController._submitPendingEvents()
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        path: '/batch',
        params: EventsController.getSdkProperties(),
        body: expect.arrayContaining([
          expect.objectContaining({
            props: expect.objectContaining({
              properties: expect.objectContaining({
                caipNetworkId: 'eip155:1'
              })
            })
          })
        ])
      })
    )
  })
})
