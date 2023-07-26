import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { ModalCtrlState } from '../types/controllerTypes'
import { CoreUtil } from '../utils/CoreUtil'
import { AccountCtrl } from './AccountCtrl'
import { ClientCtrl } from './ClientCtrl'
import { ConfigCtrl } from './ConfigCtrl'
import { OptionsCtrl } from './OptionsCtrl'
import { RouterCtrl } from './RouterCtrl'
import { WcConnectionCtrl } from './WcConnectionCtrl'

// -- types -------------------------------------------------------- //
export interface OpenOptions {
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
      const { isUiLoaded, isDataLoaded, isPreferInjected, selectedChain } = OptionsCtrl.state
      const { isConnected } = AccountCtrl.state
      const { enableNetworkView } = ConfigCtrl.state
      WcConnectionCtrl.setPairingEnabled(true)

      if (!isConnected) {
        CoreUtil.removeWalletConnectDeepLink()
      }

      if (options?.route) {
        RouterCtrl.reset(options.route)
      } else if (isConnected) {
        RouterCtrl.reset('Account')
      } else if (enableNetworkView) {
        RouterCtrl.reset('SelectNetwork')
      } else if (isPreferInjected) {
        ClientCtrl.client()
          .connectConnector('injected', selectedChain?.id)
          .catch(err => console.error(err))
        resolve()

        return
      } else {
        RouterCtrl.reset('ConnectWallet')
      }

      const { pairingUri } = WcConnectionCtrl.state
      // Open modal if essential async data is ready
      if (isUiLoaded && isDataLoaded && (pairingUri || isConnected)) {
        state.open = true
        resolve()
      }
      // Otherwise (slow network) re-attempt open checks
      else {
        const interval = setInterval(() => {
          const opts = OptionsCtrl.state
          const connection = WcConnectionCtrl.state
          if (opts.isUiLoaded && opts.isDataLoaded && (connection.pairingUri || isConnected)) {
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
