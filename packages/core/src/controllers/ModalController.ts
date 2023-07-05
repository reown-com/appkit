import { subscribeKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface ModalControllerState {
  open: boolean
}

type StateKey = keyof ModalControllerState

// -- State --------------------------------------------------------------------
const state = proxy<ModalControllerState>({
  open: false
})

// -- Controller ---------------------------------------------------------------
export const ModalController = {
  state,

  subscribe<K extends StateKey>(key: K, callback: (value: ModalControllerState[K]) => void) {
    subscribeKey(state, key, callback)
  },

  open() {
    state.open = true
  },

  close() {
    state.open = false
  }
}
