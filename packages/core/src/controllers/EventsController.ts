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
  data: Event
}

// -- State --------------------------------------------- //
const state = proxy<EventsControllerState>({
  timestamp: Date.now(),
  data: {
    type: 'track',
    event: 'MODAL_CREATED'
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

  _sendAnalyticsEvent(payload: EventsControllerState) {
    if (excluded.includes(payload.data.event)) {
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
          timestamp: payload.timestamp,
          props: payload.data
        }
      })
    } catch {
      // Fail silently
    }
  },

  sendEvent(data: EventsControllerState['data']) {
    state.timestamp = Date.now()
    state.data = data
    if (OptionsController.state.enableAnalytics) {
      EventsController._sendAnalyticsEvent(state)
    }
  }
}
