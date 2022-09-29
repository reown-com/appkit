import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { RouterCtrlState } from '../../../types/uiCtrlTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<RouterCtrlState>({
  history: ['ConnectWallet'],
  view: 'ConnectWallet'
})

// -- controller --------------------------------------------------- //
export const RouterCtrl = {
  state,

  subscribe(callback: (newState: RouterCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  push(view: RouterCtrlState['view']) {
    state.view = view
    state.history.push(view)
  },

  replace(view: RouterCtrlState['view']) {
    state.view = view
    state.history = [view]
  },

  goBack() {
    if (state.history.length > 1) {
      state.history.pop()
      const [last] = state.history.slice(-1)
      state.view = last
    }
  }
}
