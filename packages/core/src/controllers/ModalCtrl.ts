import { proxy } from 'valtio'

/**
 * Types
 */
interface State {
  open: boolean
}

/**
 * Initial State
 */
const state = proxy<State>({
  open: false
})

/**
 *
 */
export default {
  state,

  openModal() {
    state.open = true
  },

  closeModal() {
    state.open = false
  }
}
