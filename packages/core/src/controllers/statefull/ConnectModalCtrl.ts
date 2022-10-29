import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ConnectModalCtrlState } from '../../../types/statefullCtrlTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<ConnectModalCtrlState>({
  open: false,
  uri: undefined
})

// -- controller --------------------------------------------------- //
export const ConnectModalCtrl = {
  state,

  subscribe(callback: (newState: ConnectModalCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  openModal(uri: string) {
    state.uri = uri
    state.open = true
  },

  closeModal() {
    state.open = false
  }
}
