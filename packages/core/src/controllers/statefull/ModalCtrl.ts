import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ModalCtrlState } from '../../../types/statefullCtrlTypes'
import { NetworkCtrl } from '../stateless/NetworkCtrl'
import { RouterCtrl } from './RouterCtrl'

// -- initial state ------------------------------------------------ //
const state = proxy<ModalCtrlState>({
  open: false
})

// -- controller --------------------------------------------------- //
export const ModalCtrl = {
  state,

  subscribe(callback: (newState: ModalCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  open() {
    const { chains } = NetworkCtrl.get()
    if (chains.length > 1) RouterCtrl.replace('SelectNetwork')
    else RouterCtrl.replace('ConnectWallet')

    state.open = true
  },

  close() {
    state.open = false
  }
}
