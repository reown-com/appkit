import type {
  ProviderCtrlWatchCallback,
  ProviderCtrlWatchOptions
} from '../../../types/blockchainCtrlTypes'
import { ClientCtrl } from './ClientCtrl'

// -- controller --------------------------------------------------- //
export const ProviderCtrl = {
  watch(options: ProviderCtrlWatchOptions, callback: ProviderCtrlWatchCallback) {
    const unwatch = ClientCtrl.ethereum().watchProvider(options, callback)

    return unwatch
  },

  get(options?: ProviderCtrlWatchOptions) {
    const data = ClientCtrl.ethereum().getProvider(options)

    return data
  }
}
