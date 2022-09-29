import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { WebSocketProviderCtrlState } from '../../../types/blockchainCtrlTypes'
import { ClientCtrl } from './ClientCtrl'

const state = proxy<WebSocketProviderCtrlState>({} as WebSocketProviderCtrlState)

// -- controller --------------------------------------------------- //
export const WebSocketProviderCtrl = {
  state,

  subscribe(callback: (newState: WebSocketProviderCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  watch() {
    const unwatch = ClientCtrl.ethereum().watchWebSocketProvider({}, provider =>
      Object.assign(state, provider)
    )

    return unwatch
  },

  get() {
    Object.assign(state, ClientCtrl.ethereum().getWebSocketProvider({}))
  }
}
