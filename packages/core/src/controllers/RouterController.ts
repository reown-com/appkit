import { subscribeKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import type { Connector } from './ConnectorController'

// -- Types --------------------------------------------- //
export interface RouterControllerState {
  view: 'Account' | 'Connect' | 'ConnectingExternal' | 'Networks'
  history: RouterControllerState['view'][]
  data?: {
    connector: Connector
  }
}

// -- State --------------------------------------------- //
const state = proxy<RouterControllerState>({
  view: 'Connect',
  history: ['Connect']
})

type StateKey = keyof RouterControllerState

// -- Controller ---------------------------------------- //
export const RouterController = {
  state,

  subscribe<K extends StateKey>(key: K, callback: (value: RouterControllerState[K]) => void) {
    return subscribeKey(state, key, callback)
  },

  push(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    if (view !== state.view) {
      state.view = view
      state.history.push(view)
      state.data = data
    }
  },

  reset(view: RouterControllerState['view']) {
    state.view = view
    state.history = [view]
  },

  replace(view: RouterControllerState['view']) {
    if (state.history.length > 1 && state.history.at(-1) !== view) {
      state.view = view
      state.history[state.history.length - 1] = view
    }
  },

  goBack() {
    if (state.history.length > 1) {
      state.history.pop()
      const [last] = state.history.slice(-1)
      state.view = last
    }
  }
}
