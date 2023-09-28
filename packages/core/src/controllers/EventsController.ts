import { proxy, subscribe as sub } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type { Event } from '../utils/TypeUtils.js'
import { OptionsController } from './OptionsController.js'

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getAnalyticsUrl()
const api = new FetchUtil({ baseUrl })
const excluded = ['MODAL_CREATED']

// -- Types --------------------------------------------- //
export interface EventsControllerState {
  timestamp: number
  event: Event
}

// -- State --------------------------------------------- //
const state = proxy<EventsControllerState>({
  timestamp: Date.now(),
  event: {
    type: 'SYSTEM',
    name: 'MODAL_CREATED'
  }
})

// -- Controller ---------------------------------------- //
export const EventsController = {
  state,

  subscribe(callback: (newState: EventsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  _getApiHeaders() {
    return {
      'x-project-id': OptionsController.state.projectId
    }
  },

  _sendAnalyticsEvent(event: EventsControllerState) {
    if (excluded.includes(event.event.name)) {
      return
    }

    try {
      api.post({
        path: '/event',
        headers: EventsController._getApiHeaders(),
        body: {
          url: window.location.href,
          domain: window.location.hostname,
          product: 'WEB3MODAL',
          timestamp: event.timestamp,
          props: event.event
        }
      })
    } catch {
      // Silently fail
    }
  },

  sendEvent(event: EventsControllerState['event']) {
    state.timestamp = Date.now()
    state.event = event
    if (OptionsController.state.enableAnalytics) {
      EventsController._sendAnalyticsEvent(state)
    }
  }
}
