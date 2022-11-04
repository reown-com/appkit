import type { AccountCtrlWatchCallback } from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'
import { OptionsCtrl } from '../statefull/OptionsCtrl'

export const AccountCtrl = {
  watch(callback: AccountCtrlWatchCallback) {
    const unwatch = ClientCtrl.ethereum().watchAccount(account => {
      callback(account)
      if (account.isDisconnected) OptionsCtrl.setSelectedChainId(undefined)
    })

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
