import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { BlockCtrlFetchArgs, BlockCtrlState } from '../../../types/blockchainCtrlTypes'
import { ClientCtrl } from './ClientCtrl'

// -- initial state ------------------------------------------------ //
const initialState = {
  blockNumber: 0
}

const state = proxy<BlockCtrlState>(initialState)

// -- controller --------------------------------------------------- //
export const BlockCtrl = {
  state,

  subscribe(callback: (newState: BlockCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  watch(args?: BlockCtrlFetchArgs) {
    const unwatch = ClientCtrl.ethereum().watchBlockNumber(
      { listen: true, ...args },
      blockNumber => (state.blockNumber = blockNumber)
    )

    return unwatch
  },

  async fetch(args?: BlockCtrlFetchArgs) {
    const blockNumber = await ClientCtrl.ethereum().fetchBlockNumber(args)
    state.blockNumber = blockNumber
  }
}
