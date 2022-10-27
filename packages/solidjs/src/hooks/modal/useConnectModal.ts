import { ConnectModalCtrl } from '@web3modal/core'
import { createEffect, createSignal, onCleanup } from 'solid-js'

export function useConnectModal() {
  const [modal, setModal] = createSignal(ConnectModalCtrl.state)
  const [isOpen, setIsOpen] = createSignal(false)

  const unsubscribe = ConnectModalCtrl.subscribe(newModal => setModal({ ...newModal }))
  createEffect(() => setIsOpen(modal().open))
  onCleanup(() => unsubscribe())

  return {
    isOpen,
    open: ConnectModalCtrl.openModal,
    close: ConnectModalCtrl.closeModal
  }
}
