import { ConnectModalCtrl } from '@web3modal/core'

export function useConnectModal() {
  return {
    isOpen: ConnectModalCtrl.state.open,
    open: ConnectModalCtrl.openModal,
    close: ConnectModalCtrl.closeModal
  }
}
