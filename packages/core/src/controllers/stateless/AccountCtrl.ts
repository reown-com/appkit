import type { AccountCtrlWatchCallback } from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'
import { OptionsCtrl } from '../statefull/OptionsCtrl'

export const AccountCtrl = {
  watch(callback: AccountCtrlWatchCallback) {
    const unwatch = ClientCtrl.ethereum().watchAccount(callback)

    return unwatch
  },

  get() {
    const data = ClientCtrl.ethereum().getAccount()

    return data
  },

  disconnect() {
    ClientCtrl.ethereum().disconnect()
    OptionsCtrl.setSelectedChainId(undefined)
  }
}
