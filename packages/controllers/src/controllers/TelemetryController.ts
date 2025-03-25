import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { EventsController } from './EventsController'
import { CoreHelperUtil } from '../utils/CoreHelperUtil'
import { FetchUtil } from '../utils/FetchUtil'

// -- Types --------------------------------------------- //
export enum TelemetryEventType {
  ERROR = 'error'
}

export enum TelemetryErrorCategory {
  API_ERROR = 'API_ERROR',
  DATA_PARSING_ERROR = 'DATA_PARSING_ERROR',
  SECURE_SITE_ERROR = 'SECURE_SITE_ERROR',
  INTERNAL_SDK_ERROR = 'INTERNAL_SDK_ERROR'
}

export interface TelemetryEvent {
  type: TelemetryEventType
  event: string
  properties: {
    errorType?: string
    errorMessage?: string
    stackTrace?: string
    timestamp?: string
  }
}

export interface TelemetryControllerState {
  enabled: boolean
  events: TelemetryEvent[]
}

// -- Constants ----------------------------------------- //
const DEFAULT_STATE = Object.freeze<TelemetryControllerState>({
  enabled: true,
  events: []
})

const api = new FetchUtil({ baseUrl: CoreHelperUtil.getAnalyticsUrl(), clientId: null })

// Rate limiting constants
const MAX_ERRORS_PER_MINUTE = 5
const ONE_MINUTE_MS = 60 * 1000

// -- State --------------------------------------------- //
const state = proxy<TelemetryControllerState>({
  ...DEFAULT_STATE
})

// -- Controller ---------------------------------------- //
export const TelemetryController = {
  state,

  subscribeKey<K extends keyof TelemetryControllerState>(
    key: K,
    callback: (value: TelemetryControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  async sendError(error: Error, category: TelemetryErrorCategory) {
    if (!state.enabled) return

    // Check rate limiting using events array
    const now = Date.now()
    const recentErrors = state.events.filter(event => {
      const eventTime = new Date(event.properties.timestamp || '').getTime()
      return now - eventTime < ONE_MINUTE_MS
    })
    
    if (recentErrors.length >= MAX_ERRORS_PER_MINUTE) {
      // eslint-disable-next-line no-console
      console.warn('Rate limit exceeded for telemetry error reporting')
      return
    }

    const errorEvent: TelemetryEvent = {
      type: TelemetryEventType.ERROR,
      event: category,
      properties: {
        errorType: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
        timestamp: new Date().toISOString()
      }
    }

    state.events.push(errorEvent)
    try {
      if (typeof window === 'undefined') {
        return
      }

      await api.post({
        path: '/e',
        params: EventsController.getSdkProperties(),
        body: {
          eventId: CoreHelperUtil.getUUID(),
          url: window.location.href,
          domain: window.location.hostname,
          timestamp: new Date().toISOString(),
          props: {
            type: TelemetryEventType.ERROR,
            event: category,
            errorType: error.name,
            errorMessage: error.message,
            stackTrace: error.stack
          }
        }
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error sending telemetry event:', err)
    }
  },

  enable() {
    state.enabled = true
  },

  disable() {
    state.enabled = false
  },

  clearEvents() {
    state.events = []
  }
} 