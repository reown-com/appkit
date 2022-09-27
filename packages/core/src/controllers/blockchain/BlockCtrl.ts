import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import { ClientCtrl } from './ClientCtrl'

// -- types -------------------------------------------------------- //
export interface State {
  blockNumber: number
}

// -- initial state ------------------------------------------------ //
const initialState = {
  blockNumber: 0
}

const state = proxy<State>(initialState)

// -- controller --------------------------------------------------- //
export const BlockCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  watch() {
    const unwatch = ClientCtrl.ethereum().watchBlockNumber(
      { listen: true },
      blockNumber => (state.blockNumber = blockNumber)
    )

    return unwatch
  },

  async fetch() {
    const blockNumber = await ClientCtrl.ethereum().fetchBlockNumber()
    state.blockNumber = blockNumber
  },

  reset() {
    Object.assign(state, initialState)
  }
}
