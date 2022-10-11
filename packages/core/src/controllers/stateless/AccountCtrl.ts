import type { AccountCtrlWatchCallback } from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const AccountCtrl = {
  watch(callback: AccountCtrlWatchCallback, _options: undefined) {
    const unwatch = ClientCtrl.ethereum().watchAccount(callback)

    return unwatch
  },

  get() {
    const data = ClientCtrl.ethereum().getAccount()

    return data
  },

  disconnect() {
    ClientCtrl.ethereum().disconnect()
  }
}
