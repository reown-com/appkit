import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { RouterCtrlState } from '../types/controllerTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<RouterCtrlState>({
  history: ['ConnectWallet'],
  view: 'ConnectWallet',
  data: undefined
})

// -- controller --------------------------------------------------- //
export const RouterCtrl = {
  state,

  subscribe(callback: (newState: RouterCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  push(view: RouterCtrlState['view'], data?: RouterCtrlState['data']) {
    if (view !== state.view) {
      state.view = view
      if (data) {
        state.data = data
      }
      state.history.push(view)
    }
  },

  reset(view: RouterCtrlState['view']) {
    state.view = view
    state.history = [view]
  },

  replace(view: RouterCtrlState['view']) {
    if (state.history.length > 1) {
      state.history[state.history.length - 1] = view
      state.view = view
    }
  },

  goBack() {
    if (state.history.length > 1) {
      state.history.pop()
      const [last] = state.history.slice(-1)
      state.view = last
    }
  },

  setData(data: RouterCtrlState['data']) {
    state.data = data
  }
}
