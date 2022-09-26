import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { Network } from '../../../types/networkTypes'

// -- initial state ------------------------------------------------ //
const initialState = {
  chain: undefined,
  chains: []
}

const state = proxy<Network>(initialState)

// -- controller --------------------------------------------------- //
export const NetworkCtrl = {
  state,

  subscribe(callback: (newState: Network) => void) {
    return valtioSub(state, () => callback(state))
  },

  setNetwork(network: Network) {
    Object.assign(state, network)
  },

  resetNetwork() {
    Object.assign(state, initialState)
  }
}
