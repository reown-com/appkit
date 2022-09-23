import { ClientCtrl } from '@web3modal/core'

export function useProvider() {
  return {
    provider: ClientCtrl.ethereum().disconnect
  }
}
