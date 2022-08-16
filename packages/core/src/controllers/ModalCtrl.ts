import { proxy } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
interface State {
  open: boolean
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  open: false
})

// -- controller --------------------------------------------------- //
export default {
  state,

  openModal() {
    state.open = true
  },

  closeModal() {
    state.open = false
  }
}
