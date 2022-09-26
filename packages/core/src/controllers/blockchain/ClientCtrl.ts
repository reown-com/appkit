import type { EthereumOptions, Web3ModalEthereum } from '@web3modal/ethereum'
import { proxy, subscribe as valtioSub } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
export interface State {
  initialized: boolean
  ethereum?: typeof Web3ModalEthereum
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  initialized: false,
  ethereum: undefined
})

// -- controller --------------------------------------------------- //
export const ClientCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  ethereum() {
    if (!state.ethereum) throw new Error('Ethereum client was not provided')

    return state.ethereum
  },

  async setEthereumClient(options: EthereumOptions) {
    const { Web3ModalEthereum } = await import('@web3modal/ethereum')
    state.ethereum = Web3ModalEthereum.createClient(options)
    state.initialized = true
  }
}
