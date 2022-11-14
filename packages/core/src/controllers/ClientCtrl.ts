import { proxy } from 'valtio/vanilla'
import type { ClientCtrlState } from '../../types/statefullCtrlTypes'
import { OptionsCtrl } from './OptionsCtrl'

// -- initial state ------------------------------------------------ //
const state = proxy<ClientCtrlState>({
  initialized: false,
  ethereumClient: undefined
})

// -- helpers ------------------------------------------------------ //
function client() {
  if (state.ethereumClient) return state.ethereumClient

  throw new Error('ClientCtrl has no client set')
}

// -- controller --------------------------------------------------- //
export const ClientCtrl = {
  state,

  setEthereumClient(ethereumClient: ClientCtrlState['ethereumClient']) {
    if (!state.initialized && ethereumClient) {
      state.ethereumClient = ethereumClient
      OptionsCtrl.setChains(ethereumClient.chains)
      state.initialized = true
    }
  },

  // -- connector actions
  getConnectorById: client().getConnectorById,

  connectCoinbaseMobile: client().connectCoinbaseMobile,

  connectWalletConnect: client().connectWalletConnect,

  connectExtension: client().connectExtension,

  getActiveWalletConnectUri: client().getActiveWalletConnectUri,

  // -- account actions
  disconnect: client().disconnect,

  getAccount: client().getAccount,

  watchAccount: client().watchAccount
}
