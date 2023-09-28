import { proxy, subscribe as sub } from 'valtio/vanilla'
import type { Event } from '../utils/TypeUtils.js'

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

  sendEvent(event: EventsControllerState['event']) {
    state.timestamp = Date.now()
    state.event = event
  }
}
