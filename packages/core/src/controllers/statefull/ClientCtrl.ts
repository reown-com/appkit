import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type {
  ClientCtrlSetEthereumClientArgs,
  ClientCtrlState
} from '../../../types/statefullCtrlTypes'
import { ConfigCtrl } from './ConfigCtrl'
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

  async setEthereumClient(args: ClientCtrlSetEthereumClientArgs) {
    if (!state.initialized) {
      const { Web3ModalEthereum } = await import('@web3modal/ethereum')
      const { client, configChains } = Web3ModalEthereum.createClient(
        ConfigCtrl.state.projectId,
        args
      )
      state.ethereum = client
      OptionsCtrl.setChains(configChains)
      state.initialized = true
    }
  }
}
