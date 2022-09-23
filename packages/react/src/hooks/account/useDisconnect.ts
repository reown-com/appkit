import { ClientCtrl } from '@web3modal/core'

export function useDisconnect() {
  return {
    disconnect: ClientCtrl.ethereum().disconnect
  }
}
