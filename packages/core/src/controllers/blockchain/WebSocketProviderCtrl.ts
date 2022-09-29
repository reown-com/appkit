import type {
  WebSocketProviderCtrlWatchCallback,
  WebSocketProviderCtrlWatchOptions
} from '../../../types/blockchainCtrlTypes'
import { ClientCtrl } from './ClientCtrl'

// -- controller --------------------------------------------------- //
export const WebSocketProviderCtrl = {
  watch(options: WebSocketProviderCtrlWatchOptions, callback: WebSocketProviderCtrlWatchCallback) {
    const unwatch = ClientCtrl.ethereum().watchWebSocketProvider(options, callback)

    return unwatch
  },

  get() {
    const data = ClientCtrl.ethereum().getWebSocketProvider({})

    return data
  }
}
