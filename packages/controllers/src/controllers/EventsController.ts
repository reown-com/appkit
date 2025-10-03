import { proxy, subscribe as sub } from 'valtio/vanilla'

import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  ConnectorImpressionItem,
  Event,
  PendingEvent,
  WalletImpressionItem
} from '../utils/TypeUtil.js'
import { ChainController } from './ChainController.js'
import { OptionsController } from './OptionsController.js'

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getAnalyticsUrl()
const api = new FetchUtil({ baseUrl, clientId: null })
const excluded = ['MODAL_CREATED']
// SendBeacon payload limit is 64KB, using 45KB for a safe margin, also 45KB is approx ~200 events which is plenty
const MAX_PENDING_EVENTS_KB = 45
// Flush events every 10 seconds
const FLUSH_EVENTS_INTERVAL_MS = 1000 * 10
// -- Types --------------------------------------------- //
export interface EventsControllerState {
  timestamp: number
  lastFlush: number
  reportedErrors: Record<string, boolean>
  data: Event
  pendingEvents: PendingEvent[]
  subscribedToVisibilityChange: boolean
  walletImpressions: (WalletImpressionItem | ConnectorImpressionItem)[]
}

// -- State --------------------------------------------- //
const state = proxy<EventsControllerState>({
  timestamp: Date.now(),
  lastFlush: Date.now(),
  reportedErrors: {},
  data: {
    type: 'track',
    event: 'MODAL_CREATED'
  },
  pendingEvents: [],
  subscribedToVisibilityChange: false,
  walletImpressions: []
})

// -- Controller ---------------------------------------- //
export const EventsController = {
  state,

  subscribe(callback: (newState: EventsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  getSdkProperties() {
    const { projectId, sdkType, sdkVersion } = OptionsController.state

    return {
      projectId,
      st: sdkType,
      sv: sdkVersion || 'html-wagmi-4.2.2'
    }
  },
  shouldFlushEvents() {
    const isOverMaxSize = JSON.stringify(state.pendingEvents).length / 1024 > MAX_PENDING_EVENTS_KB
    const isExpired = state.lastFlush + FLUSH_EVENTS_INTERVAL_MS < Date.now()

    return isOverMaxSize || isExpired
  },

  _setPendingEvent(payload: EventsControllerState) {
    try {
      let address = ChainController.getAccountData()?.address

      if ('address' in payload.data && payload.data.address) {
        address = payload.data.address
      }

      if (excluded.includes(payload.data.event) || typeof window === 'undefined') {
        return
      }

      const caipNetworkId = ChainController.getActiveCaipNetwork()?.caipNetworkId
      this.state.pendingEvents.push({
        eventId: CoreHelperUtil.getUUID(),
        url: window.location.href,
        domain: window.location.hostname,
        timestamp: payload.timestamp,
        props: {
          ...payload.data,
          address,
          properties: {
            ...('properties' in payload.data ? payload.data.properties : {}),
            caipNetworkId
          }
        }
      })

      state.reportedErrors['FORBIDDEN'] = false
      const shouldFlush = EventsController.shouldFlushEvents()
      // If the pending events are too large, submit them as sendBeacon has a limit of 64KB
      if (shouldFlush) {
        EventsController._submitPendingEvents()
      }
    } catch (err) {
      console.warn('_setPendingEvent', err)
    }
  },

  sendEvent(data: Event) {
    state.timestamp = Date.now()
    state.data = data
    const MANDATORY_EVENTS: Event['event'][] = [
      'INITIALIZE',
      'CONNECT_SUCCESS',
      'SOCIAL_LOGIN_SUCCESS'
    ]
    if (OptionsController.state.features?.analytics || MANDATORY_EVENTS.includes(data.event)) {
      EventsController._setPendingEvent(state)
    }
    // Calling this function here to make sure document is ready and defined before subscribing to visibility change
    this.subscribeToFlushTriggers()
  },

  /**
   * Adds a wallet impression item to the aggregated list. These are flushed as a single
   * WALLET_IMPRESSION_V2 batch in _submitPendingEvents.
   */
  sendWalletImpressionEvent(item: WalletImpressionItem | ConnectorImpressionItem) {
    state.walletImpressions.push(item)
  },

  _transformPendingEventsForBatch(events: PendingEvent[]) {
    try {
      return events.filter(evt => {
        const eventName = evt.props.event

        return eventName !== 'WALLET_IMPRESSION_V2'
      })
    } catch {
      return events
    }
  },

  _submitPendingEvents() {
    state.lastFlush = Date.now()
    if (state.pendingEvents.length === 0 && state.walletImpressions.length === 0) {
      return
    }
    try {
      const batch = EventsController._transformPendingEventsForBatch(state.pendingEvents)

      if (state.walletImpressions.length) {
        batch.push({
          eventId: CoreHelperUtil.getUUID(),
          url: window.location.href,
          domain: window.location.hostname,
          timestamp: Date.now(),
          props: {
            type: 'track',
            event: 'WALLET_IMPRESSION_V2',
            items: [...state.walletImpressions]
          }
        })
      }

      api.sendBeacon({
        path: '/batch',
        params: EventsController.getSdkProperties(),
        body: batch
      })
      state.reportedErrors['FORBIDDEN'] = false
      state.pendingEvents = []
      state.walletImpressions = []
    } catch (err) {
      state.reportedErrors['FORBIDDEN'] = true
    }
  },

  subscribeToFlushTriggers() {
    if (state.subscribedToVisibilityChange) {
      return
    }
    if (typeof document === 'undefined') {
      return
    }

    state.subscribedToVisibilityChange = true
    // Submit pending events when the document is hidden
    document?.addEventListener?.('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        EventsController._submitPendingEvents()
      }
    })

    // Submit pending events when the document is frozen (triggered on mobile)
    document?.addEventListener?.('freeze', () => {
      EventsController._submitPendingEvents()
    })

    // Submit pending events when the window is hidden
    window?.addEventListener?.('pagehide', () => {
      EventsController._submitPendingEvents()
    })

    // Submit pending events every 10 seconds
    setInterval(() => {
      EventsController._submitPendingEvents()
    }, FLUSH_EVENTS_INTERVAL_MS)
  }
}
