import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ModalCtrlState } from '../../../types/statefullCtrlTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<ModalCtrlState>({
  open: false
})

// -- controller --------------------------------------------------- //
export const ModalCtrl = {
  state,

  subscribe(callback: (newState: ModalCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  open() {
    state.open = true
  },

  close() {
    state.open = false
  }
}
