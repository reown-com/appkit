import type {
  WebSocketProviderCtrlWatchCallback,
  WebSocketProviderCtrlWatchOptions
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const WebSocketProviderCtrl = {
  watch(callback: WebSocketProviderCtrlWatchCallback, options: WebSocketProviderCtrlWatchOptions) {
    const unwatch = ClientCtrl.ethereum().watchWebSocketProvider(options, callback)

    return unwatch
  },

  get(options: WebSocketProviderCtrlWatchOptions) {
    const data = ClientCtrl.ethereum().getWebSocketProvider(options)

    return data
  }
}
