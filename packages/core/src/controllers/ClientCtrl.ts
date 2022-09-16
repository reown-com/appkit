import type { EthereumClient, Web3ModalEthereum } from '@web3modal/ethereum'
import { proxy } from 'valtio/vanilla'

// -- types -------------------------------------------------------- //
export interface State {
  ethereum?: typeof Web3ModalEthereum
}

// -- initial state ------------------------------------------------ //
const state = proxy<State>({
  ethereum: undefined
})

// -- controller --------------------------------------------------- //
export const ClientCtrl = {
  ethereum() {
    if (!state.ethereum) throw new Error('Ethereum client was not provided')

    return state.ethereum
  },

  async setEthereumClient(ethereumClient: EthereumClient) {
    const { Web3ModalEthereum } = await import('@web3modal/ethereum')
    state.ethereum = Web3ModalEthereum.createClient(ethereumClient)
  }
}
