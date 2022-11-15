import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ToastCtrlState } from '../types/controllerTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<ToastCtrlState>({
  open: false,
  message: '',
  variant: 'success'
})

// -- controller --------------------------------------------------- //
export const ToastCtrl = {
  state,

  subscribe(callback: (newState: ToastCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  openToast(message: ToastCtrlState['message'], variant: ToastCtrlState['variant']) {
    state.open = true
    state.message = message
    state.variant = variant
  },

  closeToast() {
    state.open = false
  }
}
