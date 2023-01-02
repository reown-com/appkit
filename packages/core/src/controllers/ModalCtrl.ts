import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ModalCtrlState } from '../types/controllerTypes'
import { OptionsCtrl } from './OptionsCtrl'
import { RouterCtrl } from './RouterCtrl'

// -- types -------------------------------------------------------- //
export interface OpenOptions {
  uri?: string
  standaloneChains?: string[]
  route?: 'Account' | 'ConnectWallet' | 'Help' | 'SelectNetwork'
}

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

  open(options?: OpenOptions) {
    const { isConnected, isStandalone } = OptionsCtrl.state

    if (isStandalone) {
      OptionsCtrl.setStandaloneUri(options?.uri)
      OptionsCtrl.setStandaloneChains(options?.standaloneChains)
      RouterCtrl.replace('ConnectWallet')
    } else if (options?.route) {
      RouterCtrl.replace(options.route)
    } else if (isConnected) {
      RouterCtrl.replace('Account')
    } else {
      RouterCtrl.replace('ConnectWallet')
    }

    state.open = true
  },

  close() {
    state.open = false
  }
}
