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
    if (options?.route) {
      RouterCtrl.replace(options.route)
    }
    if (options?.uri) {
      OptionsCtrl.setStandaloneUri(options.uri)
    }
    if (options?.standaloneChains?.length) {
      OptionsCtrl.setStandaloneChains(options.standaloneChains)
    }
    state.open = true
  },

  close() {
    state.open = false
  }
}
