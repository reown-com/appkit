import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type CaipNetwork } from '@reown/appkit-common'

import {
  ChainController,
  EventsController,
  FetchUtil,
  OptionsController
} from '../../exports/index.js'

// -- Setup --------------------------------------------------------------------
const event = { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } } as const

// -- Tests --------------------------------------------------------------------

describe('EventsController', () => {
  beforeEach(() => {
    // Reset the state
    EventsController.state.pendingEvents = []
    EventsController.state.subscribedToVisibilityChange = false

    // Reset OptionsController state
    OptionsController.state.features = undefined

    // Reset all mocks and spies
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should have valid default state', () => {
    expect(EventsController.state.data).toEqual({
      type: 'track',
      event: 'MODAL_CREATED'
    })
  })

  it('should update state correctly on sendEvent()', () => {
    // Enable analytics to ensure events are tracked
    OptionsController.state.features = { analytics: true }
    EventsController.sendEvent(event)
    expect(EventsController.state.data).toEqual(event)
  })

  it('should subscribe to flush triggers only once', () => {
    const docSpy = vi.spyOn(document, 'addEventListener')
    const winSpy = vi.spyOn(window, 'addEventListener')

    for (let i = 0; i < 10; i++) {
      EventsController.subscribeToFlushTriggers()
    }

    // Should be called 3 times total (visibilitychange, freeze, pagehide) but only on the first call
    expect(docSpy).toHaveBeenCalledTimes(2) // visibilitychange and freeze
    expect(winSpy).toHaveBeenCalledTimes(1) // pagehide

    expect(docSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    expect(docSpy).toHaveBeenCalledWith('freeze', expect.any(Function))
    expect(winSpy).toHaveBeenCalledWith('pagehide', expect.any(Function))

    expect(EventsController.state.subscribedToVisibilityChange).toEqual(true)
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

  it('should submit pending events on visibilitychange', async () => {
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

    // Mock document.addEventListener to capture the visibilitychange event listener
    let visibilityHandler: EventListener | null = null
    vi.spyOn(document, 'addEventListener').mockImplementation((type: string, handler: any) => {
      if (type === 'visibilitychange') {
        visibilityHandler = handler
      }
    })

    // Subscribe to flush triggers to set up event listeners
    EventsController.subscribeToFlushTriggers()

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true
    })

    // Simulate visibilitychange event by calling the handler directly
    if (visibilityHandler) {
      ;(visibilityHandler as (event: Event) => void)(new Event('visibilitychange'))
    }

    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledTimes(1)
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/batch',
        params: EventsController.getSdkProperties()
      })
    )

    expect(EventsController.state.pendingEvents).toEqual([])
  })

  it('should submit pending events on freeze', async () => {
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)

    EventsController._setPendingEvent({
      ...EventsController.state,
      data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
    })

    // Mock document.addEventListener to capture the freeze event listener
    let freezeHandler: EventListener | null = null
    vi.spyOn(document, 'addEventListener').mockImplementation((type: string, handler: any) => {
      if (type === 'freeze') {
        freezeHandler = handler
      }
    })

    // Subscribe to flush triggers to set up event listeners
    EventsController.subscribeToFlushTriggers()

    // Simulate freeze event by calling the handler directly
    if (freezeHandler) {
      ;(freezeHandler as (event: Event) => void)(new Event('freeze'))
    }

    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledTimes(1)
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/batch',
        params: EventsController.getSdkProperties()
      })
    )
  })

  it('should submit pending events on pagehide', async () => {
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)

    EventsController._setPendingEvent({
      ...EventsController.state,
      data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
    })

    // Mock window.addEventListener to capture the pagehide event listener
    let pagehideHandler: EventListener | null = null
    vi.spyOn(window, 'addEventListener').mockImplementation((type: string, handler: any) => {
      if (type === 'pagehide') {
        pagehideHandler = handler
      }
    })

    // Subscribe to flush triggers to set up event listeners
    EventsController.subscribeToFlushTriggers()

    // Simulate pagehide event by calling the handler directly
    if (pagehideHandler) {
      ;(pagehideHandler as (event: Event) => void)(new Event('pagehide'))
    }

    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledTimes(1)
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/batch',
        params: EventsController.getSdkProperties()
      })
    )
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
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledTimes(1)
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/batch',
        params: EventsController.getSdkProperties()
      })
    )
    expect(EventsController.state.pendingEvents.length).toEqual(3)
  })

  it('should submit pending events on flush interval', async () => {
    vi.useFakeTimers()
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)

    // Add a pending event first
    EventsController._setPendingEvent({
      ...EventsController.state,
      data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
    })

    // Set lastFlush to past time to trigger flush
    EventsController.state.lastFlush = Date.now() - 1000 * 10 - 1

    // Trigger the flush by calling _setPendingEvent which checks shouldFlushEvents
    EventsController._setPendingEvent({
      ...EventsController.state,
      data: { type: 'track', event: 'MODAL_CLOSE', properties: { connected: true } }
    })

    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledTimes(1)
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/batch',
        params: EventsController.getSdkProperties()
      })
    )
    vi.useRealTimers()
  })

  it('should submit pending events on visibilitychange', async () => {
    vi.spyOn(FetchUtil.prototype, 'sendBeacon').mockResolvedValue(true)

    // Enable analytics to ensure events are tracked
    OptionsController.state.features = { analytics: true }

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

    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledTimes(1)
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledWith(
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

    // Enable analytics to ensure events are tracked
    OptionsController.state.features = { analytics: true }

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

    // Enable analytics to ensure events are tracked
    OptionsController.state.features = { analytics: true }

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
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledTimes(1)
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledWith(
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

    // Enable analytics to ensure events are tracked
    OptionsController.state.features = { analytics: true }

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
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledTimes(1)
    expect(FetchUtil.prototype.sendBeacon).toHaveBeenCalledWith(
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
