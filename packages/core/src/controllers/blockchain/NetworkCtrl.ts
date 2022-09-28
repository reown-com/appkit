import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { NetworkCtrlState } from '../../../types/networkTypes'
import { ClientCtrl } from './ClientCtrl'

// -- initial state ------------------------------------------------ //
const initialState = {
  chain: undefined,
  chains: []
}

const state = proxy<NetworkCtrlState>(initialState)

// -- controller --------------------------------------------------- //
export const NetworkCtrl = {
  state,

  subscribe(callback: (newState: NetworkCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  watch() {
    const unwatch = ClientCtrl.ethereum().watchNetwork(network => Object.assign(state, network))

    return unwatch
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
