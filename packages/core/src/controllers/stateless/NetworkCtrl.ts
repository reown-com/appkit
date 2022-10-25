import type {
  NetworkCtrlSwitchNetworkArgs,
  NetworkCtrlWatchCallback
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'
import { OptionsCtrl } from '../statefull/OptionsCtrl'

export const NetworkCtrl = {
  watch(callback: NetworkCtrlWatchCallback) {
    const unwatch = ClientCtrl.ethereum().watchNetwork(callback)

    return unwatch
  },

  get() {
    const data = ClientCtrl.ethereum().getNetwork()

    return data
  },

  async switchNetwork(args: NetworkCtrlSwitchNetworkArgs) {
    const data = await ClientCtrl.ethereum().switchNetwork(args)
    OptionsCtrl.setSelectedChainId(args.chainId)

    return data
  }
}
