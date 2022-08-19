import { proxy, subscribe as valtioSub } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
export type RouterViewType = 'ConnectWallet' | 'SelectNetwork'

interface State {
  history: RouterViewType[]
  view: RouterViewType
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  history: ['ConnectWallet'],
  view: 'ConnectWallet'
})

// -- controller --------------------------------------------------- //
export const RouterCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  push(view: State['view']) {
    state.view = view
    state.history.push(view)
  },

  replace(view: State['view']) {
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
