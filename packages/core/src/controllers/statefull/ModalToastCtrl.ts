import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ModalToastCtrlState } from '../../../types/statefullCtrlTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<ModalToastCtrlState>({
  open: false,
  message: '',
  variant: 'success'
})

// -- controller --------------------------------------------------- //
export const ModalToastCtrl = {
  state,

  subscribe(callback: (newState: ModalToastCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  openToast(message: ModalToastCtrlState['message'], variant: ModalToastCtrlState['variant']) {
    state.open = true
    state.message = message
    state.variant = variant
  },

  closeToast() {
    state.open = false
  }
}
