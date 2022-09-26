import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { Network } from '../../../types/networkTypes'
import { ClientCtrl } from './ClientCtrl'

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

  watch() {
    return ClientCtrl.ethereum().watchNetwork(network => Object.assign(state, network))
  },

  get() {
    Object.assign(state, ClientCtrl.ethereum().getNetwork())
  },

  switch() {
    return ClientCtrl.ethereum().switchNetwork
  },

  reset() {
    Object.assign(state, initialState)
  }
}
