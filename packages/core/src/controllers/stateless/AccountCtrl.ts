import type { AccountCtrlWatchCallback } from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

function addressCallback(address: string | undefined, callback: AccountCtrlWatchCallback) {
  if (address)
    callback({
      address,
      isConnected: true
    })
  else callback({ address: undefined, isConnected: false })
}

export const AccountCtrl = {
  watch(_options: undefined, callback: AccountCtrlWatchCallback) {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        return ClientCtrl.ethereum().watchAccount(({ address }) =>
          addressCallback(address, callback)
        )
      case 'solana':
        return ClientCtrl.solana().watchAddress(address => addressCallback(address, callback))
      default:
        throw new Error('No provider that supports that getting account')
    }
  },

  get() {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        return ClientCtrl.ethereum().getAccount()
      case 'solana':
        console.log('Here get', ClientCtrl.solana().getAccount())

        return ClientCtrl.solana().getAccount()
      default:
        throw new Error('No provider that supports that getting account')
    }
  },

  disconnect() {
    switch (ClientCtrl.getActiveClient()) {
      case 'ethereum':
        return ClientCtrl.ethereum().disconnect()
      case 'solana':
        return ClientCtrl.solana().disconnect()
      default:
        throw new Error('No provider that supports that getting account')
    }
  }
}
