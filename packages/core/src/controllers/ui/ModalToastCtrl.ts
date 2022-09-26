import { proxy, subscribe as valtioSub } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
export interface State {
  open: boolean
  message: string
  variant: 'error' | 'success'
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  open: false,
  message: '',
  variant: 'success'
})

// -- controller --------------------------------------------------- //
export const ModalToastCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  openToast(message: State['message'], variant: State['variant']) {
    state.open = true
    state.message = message
    state.variant = variant
  },

  closeToast() {
    state.open = false
  }
}
