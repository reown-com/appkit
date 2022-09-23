import { ClientCtrl } from '@web3modal/core'

// -- hook --------------------------------------------------------- //
export function useNetwork() {
  return ClientCtrl.ethereum().getNetwork()
}
