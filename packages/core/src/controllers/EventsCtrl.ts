import { proxy, snapshot, subscribe as valtioSub } from 'valtio/vanilla'
import type { EventsCtrlState, ModalEvent, ModalEventData } from '../types/controllerTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<EventsCtrlState>({
  userSessionId: '',
  events: [],
  connectedWalletId: undefined
})

// -- controller --------------------------------------------------- //
export const EventsCtrl = {
  state,

  subscribe(callback: (newEvent: ModalEvent) => void) {
    return valtioSub(state.events, () => callback(snapshot(state.events[state.events.length - 1])))
  },

  initialize() {
    if (typeof crypto !== 'undefined') {
      state.userSessionId = crypto.randomUUID()
    }
  },

  setConnectedWalletId(connectedWalletId: EventsCtrlState['connectedWalletId']) {
    state.connectedWalletId = connectedWalletId
  },

  click(data: ModalEventData) {
    const event = {
      type: 'CLICK' as const,
      name: data.name,
      userSessionId: state.userSessionId,
      timestamp: Date.now(),
      data
    }
    state.events.push(event)
  },

  track(data: ModalEventData) {
    const event = {
      type: 'TRACK' as const,
      name: data.name,
      userSessionId: state.userSessionId,
      timestamp: Date.now(),
      data
    }
    state.events.push(event)
  },

  view(data: ModalEventData) {
    const event = {
      type: 'VIEW' as const,
      name: data.name,
      userSessionId: state.userSessionId,
      timestamp: Date.now(),
      data
    }
    state.events.push(event)
  }
}
