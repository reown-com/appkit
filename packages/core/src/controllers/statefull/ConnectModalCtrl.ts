import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ConnectModalCtrlState } from '../../../types/statefullCtrlTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<ConnectModalCtrlState>({
  open: false
})

// -- controller --------------------------------------------------- //
export const ConnectModalCtrl = {
  state,

  subscribe(callback: (newState: ConnectModalCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  openModal() {
    state.open = true
  },

  closeModal() {
    state.open = false
  }
}
