import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface ModalControllerState {
  open: boolean
}

// -- State --------------------------------------------------------------------
const state = proxy<ModalControllerState>({
  open: false
})

// -- Controller ---------------------------------------------------------------
export const ModalController = {
  state,

  open() {
    state.open = true
  },

  close() {
    state.open = false
  }
}
