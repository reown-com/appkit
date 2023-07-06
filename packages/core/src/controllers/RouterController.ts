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

// -- Controller ---------------------------------------- //
export const RouterController = {
  state,

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
