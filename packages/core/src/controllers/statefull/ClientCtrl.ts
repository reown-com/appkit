import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ClientCtrlState } from '../../../types/statefullCtrlTypes'
import { OptionsCtrl } from './OptionsCtrl'

// -- initial state ------------------------------------------------ //
const state = proxy<ClientCtrlState>({
  initialized: false,
  ethereum: undefined
})

// -- controller --------------------------------------------------- //
export const ClientCtrl = {
  state,

  subscribe(callback: (newState: ClientCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  ethereum() {
    if (!state.ethereum) throw new Error('Ethereum client was not provided')

    return state.ethereum
  },

  setEthereumClient(ethereumClient: ClientCtrlState['ethereum']) {
    if (!state.initialized && ethereumClient) {
      state.ethereum = ethereumClient
      OptionsCtrl.setChains(ethereumClient.chains)
      state.initialized = true
    }
  }
}
