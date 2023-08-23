import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { WcConnectionCtrlState } from '../types/controllerTypes'

// -- initial state ------------------------------------------------ //
const state = proxy<WcConnectionCtrlState>({
  pairingEnabled: false,
  pairingUri: '',
  pairingError: false
})

// -- controller --------------------------------------------------- //
export const WcConnectionCtrl = {
  state,

  subscribe(callback: (newState: WcConnectionCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  setPairingUri(pairingUri: WcConnectionCtrlState['pairingUri']) {
    state.pairingUri = pairingUri
  },

  setPairingError(pairingError: WcConnectionCtrlState['pairingError']) {
    state.pairingError = pairingError
  },

  setPairingEnabled(pairingEnabled: WcConnectionCtrlState['pairingEnabled']) {
    state.pairingEnabled = pairingEnabled
  }
}
