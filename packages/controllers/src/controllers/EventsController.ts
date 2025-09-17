import { proxy, subscribe as sub } from 'valtio/vanilla'

import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type { Event, PendingEvent } from '../utils/TypeUtil.js'
import { ChainController } from './ChainController.js'
import { OptionsController } from './OptionsController.js'

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getAnalyticsUrl()
const api = new FetchUtil({ baseUrl, clientId: null })
const excluded = ['MODAL_CREATED']
// SendBeacon payload limit is 64KB, using 45KB for a safe margin, also 45KB is approx ~200 events which is plenty
const MAX_PENDING_EVENTS_KB = 45
// -- Types --------------------------------------------- //
export interface EventsControllerState {
  timestamp: number
  reportedErrors: Record<string, boolean>
  data: Event
  pendingEvents: PendingEvent[]
  subscribedToVisibilityChange: boolean
}

// -- State --------------------------------------------- //
const state = proxy<EventsControllerState>({
  timestamp: Date.now(),
  reportedErrors: {},
  data: {
    type: 'track',
    event: 'MODAL_CREATED'
  },
  pendingEvents: [],
  subscribedToVisibilityChange: false
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

      // If the pending events are too large, submit them as sendBeacon has a limit of 64KB
      if (JSON.stringify(state.pendingEvents).length / 1024 > MAX_PENDING_EVENTS_KB) {
        EventsController._submitPendingEvents()
      }
    } catch (err) {
      console.warn('_setPendingEvent', err)
    }
  },

  sendEvent(data: EventsControllerState['data']) {
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
    this._subscribeToVisibilityChange()
  },

  _submitPendingEvents() {
    if (state.pendingEvents.length === 0) {
      return
    }
    try {
      api.sendBeacon({
        path: '/batch',
        params: EventsController.getSdkProperties(),
        body: state.pendingEvents
      })
      state.reportedErrors['FORBIDDEN'] = false
      state.pendingEvents = []
    } catch (err) {
      state.reportedErrors['FORBIDDEN'] = true
    }
  },
  _subscribeToVisibilityChange() {
    if (state.subscribedToVisibilityChange) {
      return
    }
    if (typeof document === 'undefined') {
      return
    }

    state.subscribedToVisibilityChange = true
    document?.addEventListener?.('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        EventsController._submitPendingEvents()
      }
    })
  }
}
