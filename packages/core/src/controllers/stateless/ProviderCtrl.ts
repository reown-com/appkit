import type {
  ProviderCtrlWatchCallback,
  ProviderCtrlWatchOptions
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const ProviderCtrl = {
  watch(callback: ProviderCtrlWatchCallback, options: ProviderCtrlWatchOptions) {
    const unwatch = ClientCtrl.ethereum().watchProvider(options, callback)

    return unwatch
  },

  get(options: ProviderCtrlWatchOptions) {
    const data = ClientCtrl.ethereum().getProvider(options)

    return data
  }
}
