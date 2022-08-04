import { proxy } from 'valtio'

/**
 * Types
 */
interface State {
  connectModalOpen: boolean
}

/**
 * Initial State
 */
const state = proxy<State>({
  connectModalOpen: false
})

/**
 *
 */
export default {
  state,

  openConnectModal() {
    state.connectModalOpen = true
  },

  closeConnectModal() {
    state.connectModalOpen = false
  }
}
