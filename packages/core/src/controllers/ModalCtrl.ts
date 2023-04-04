import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ModalCtrlState } from '../types/controllerTypes'
import { AccountCtrl } from './AccountCtrl'
import { ConfigCtrl } from './ConfigCtrl'
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

  async open(options?: OpenOptions) {
    return new Promise<void>(resolve => {
      const { isStandalone, isUiLoaded, isDataLoaded } = OptionsCtrl.state
      const { isConnected } = AccountCtrl.state
      const { enableNetworkView } = ConfigCtrl.state

      if (isStandalone) {
        OptionsCtrl.setStandaloneUri(options?.uri)
        OptionsCtrl.setStandaloneChains(options?.standaloneChains)
        RouterCtrl.replace('ConnectWallet')
      } else if (options?.route) {
        RouterCtrl.replace(options.route)
      } else if (isConnected) {
        RouterCtrl.replace('Account')
      } else if (enableNetworkView) {
        RouterCtrl.replace('SelectNetwork')
      } else {
        RouterCtrl.replace('ConnectWallet')
      }

      // Open modal if essential async data is ready
      if (isUiLoaded && isDataLoaded) {
        state.open = true
        resolve()
      }
      // Otherwise (slow network) re-attempt open checks
      else {
        const interval = setInterval(() => {
          if (OptionsCtrl.state.isUiLoaded && OptionsCtrl.state.isDataLoaded) {
            clearInterval(interval)
            state.open = true
            resolve()
          }
        }, 200)
      }
    })
  },

  close() {
    state.open = false
  }
}
