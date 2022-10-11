import type {
  NetworkCtrlSwitchNetworkArgs,
  NetworkCtrlWatchCallback
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const NetworkCtrl = {
  watch(callback: NetworkCtrlWatchCallback, _options: undefined) {
    const unwatch = ClientCtrl.ethereum().watchNetwork(callback)

    return unwatch
  },

  get() {
    const data = ClientCtrl.ethereum().getNetwork()

    return data
  },

  async switchNetwork(args: NetworkCtrlSwitchNetworkArgs) {
    const data = await ClientCtrl.ethereum().switchNetwork(args)

    return data
  }
}
