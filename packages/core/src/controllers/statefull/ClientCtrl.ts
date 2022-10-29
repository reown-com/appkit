import type { Web3ModalSolana } from '@web3modal/solana'
import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type {
  ClientCtrlSetEthereumClientArgs,
  ClientCtrlSetSolanaClientArgs,
  ClientCtrlState
} from '../../../types/statefullCtrlTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<ClientCtrlState>({
  initialized: false,
  ethereum: undefined,
  solana: undefined
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
    const { Web3ModalEthereum } = await import('@web3modal/ethereum')
    state.ethereum = Web3ModalEthereum.createClient(args)
    state.initialized = true
  },

  async setSolanaClient(args: ClientCtrlSetSolanaClientArgs) {
    const { Web3ModalSolana } = await import('@web3modal/solana')
    state.solana = Web3ModalSolana.createClient(args)
    state.initialized = true
  },

  solana(): typeof Web3ModalSolana {
    if (!state.solana) throw new Error('Solana client was not provided')

    return state.solana
  },

  getActiveClient() {
    if (state.solana) return 'solana'
    if (state.ethereum) return 'ethereum'

    throw new Error('No active client')
  }
}
