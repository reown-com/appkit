import type { WebSocketProvider } from '@web3modal/ethereum'
import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import { ClientCtrl } from './ClientCtrl'

const state = proxy<WebSocketProvider>({} as WebSocketProvider)

// -- controller --------------------------------------------------- //
export const WebSocketProviderCtrl = {
  state,

  subscribe(callback: (newState: WebSocketProvider) => void) {
    return valtioSub(state, () => callback(state))
  },

  watch() {
    return ClientCtrl.ethereum().watchWebSocketProvider({}, provider =>
      Object.assign(state, provider)
    )
  },

  get() {
    Object.assign(state, ClientCtrl.ethereum().getWebSocketProvider({}))
  }
}
