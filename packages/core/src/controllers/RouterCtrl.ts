import { proxy } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
export type RouterView = 'ConnectWallet' | 'SelectNetwork'

interface State {
  history: RouterView[]
  view: RouterView
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  history: ['ConnectWallet'],
  view: 'ConnectWallet'
})

// -- controller --------------------------------------------------- //
export default {
  state,

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
