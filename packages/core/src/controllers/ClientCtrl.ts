import type { EthereumClient } from '@web3modal/ethereum'
import { proxy } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
export interface State {
  ethereum?: EthereumClient
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  ethereum: undefined
})

// -- controller --------------------------------------------------- //
export const ClientCtrl = {
  ...state,

  async setEthereumClient(ethereum: EthereumClient) {
    const { Web3ModalEthereum } = await import('@web3modal/ethereum')
    state.ethereum = Web3ModalEthereum.createClient(ethereum)
  }
}
