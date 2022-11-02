import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ModalCtrlState } from '../../../types/statefullCtrlTypes'
import { OptionsCtrl } from './OptionsCtrl'
import { RouterCtrl } from './RouterCtrl'

// -- initial state ------------------------------------------------ //
const state = proxy<ModalCtrlState>({
  open: false,
  wcUri: undefined
})

// -- controller --------------------------------------------------- //
export const ModalCtrl = {
  state,

  subscribe(callback: (newState: ModalCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  open(wcUri?: ModalCtrlState['wcUri']) {
    const { chains } = OptionsCtrl.state
    if (chains?.length ? chains.length > 1 : false) RouterCtrl.replace('SelectNetwork')
    else RouterCtrl.replace('ConnectWallet')
    state.wcUri = wcUri
    state.open = true
  },

  close() {
    state.open = false
  }
}
