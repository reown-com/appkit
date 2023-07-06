import { subscribeKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface RouterControllerState {
  view: 'Account' | 'Connect' | 'Networks'
  history: RouterControllerState['view'][]
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
    subscribeKey(state, key, callback)
  },

  push(view: RouterControllerState['view']) {
    if (view !== state.view) {
      state.view = view
      state.history.push(view)
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
