import { ClientCtrl } from '@web3modal/core'

export function useDisconnect() {
  return ClientCtrl.ethereum().disconnect
}
