import { proxy, subscribe as valtioSub } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
interface State {
  open: boolean
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  open: false
})

// -- controller --------------------------------------------------- //
export const ModalCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  openModal() {
    state.open = true
  },

  closeModal() {
    state.open = false
  }
}
