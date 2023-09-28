import { proxy, subscribe as sub } from 'valtio/vanilla'
import type { Event } from '../utils/TypeUtils.js'

// -- Types --------------------------------------------- //
type EventsControllerState = Event

// -- State --------------------------------------------- //
const state = proxy<EventsControllerState>({} as EventsControllerState)

// -- Controller ---------------------------------------- //
export const EventsController = {
  state,

  subscribe(callback: (newState: EventsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  sendEvent(event: EventsControllerState) {
    Object.assign(state, event)
  }
}
