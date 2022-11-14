import { proxy } from 'valtio/vanilla'
import type { ClientCtrlState } from '../../types/statefullCtrlTypes'
import { OptionsCtrl } from './OptionsCtrl'

// -- initial state ------------------------------------------------ //
const state = proxy<ClientCtrlState>({
  initialized: false,
  ethereumClient: undefined
})

// -- controller -- As function to enable correct ssr handling
export const ClientCtrl = {
  setEthereumClient(ethereumClient: ClientCtrlState['ethereumClient']) {
    if (!state.initialized && ethereumClient) {
      state.ethereumClient = ethereumClient
      OptionsCtrl.setChains(ethereumClient.chains)
      state.initialized = true
    }
  },

  client() {
    if (state.ethereumClient) return state.ethereumClient

    throw new Error('ClientCtrl has no client set')
  }
}
