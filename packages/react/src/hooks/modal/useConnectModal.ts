import { ConnectModalCtrl } from '@web3modal/core'

export function useConnectModal() {
  return {
    open: ConnectModalCtrl.openModal,
    close: ConnectModalCtrl.closeModal
  }
}
