import { proxy, subscribe as valtioSub } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
export interface State {
  open: boolean
  message: string
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  open: false,
  message: ''
})

// -- controller --------------------------------------------------- //
export const ModalToastCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  openToast(message: State['message']) {
    state.open = true
    state.message = message
  },

  closeToast() {
    state.open = false
  }
}
