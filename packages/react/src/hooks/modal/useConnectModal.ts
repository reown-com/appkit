import { ConnectModalCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useConnectModal() {
  const [modal, setModal] = useState(ConnectModalCtrl.state)

  useEffect(() => {
    const unsubscribe = ConnectModalCtrl.subscribe(newModal => setModal({ ...newModal }))

    return () => unsubscribe()
  }, [])

  return {
    isOpen: modal.open,
    open: ConnectModalCtrl.openModal,
    close: ConnectModalCtrl.closeModal
  }
}
