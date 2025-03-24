import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

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
    uncaught?: boolean
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

  sendError(error: Error, category: TelemetryErrorCategory, uncaught = false) {
    if (!state.enabled) return

    const errorEvent: TelemetryEvent = {
      type: TelemetryEventType.ERROR,
      event: category,
      properties: {
        errorType: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
        uncaught,
        timestamp: new Date().toISOString()
      }
    }

    state.events.push(errorEvent)
    // TODO: Replace with actual Pulse API integration
    // PulseAPI.sendEvent(errorEvent)
    console.error('Telemetry error event:', errorEvent)
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