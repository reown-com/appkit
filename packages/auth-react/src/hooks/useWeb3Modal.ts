import { ModalCtrl, OptionsCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useWeb3Modal() {
  const [modal, setModal] = useState(ModalCtrl.state)

  useEffect(() => {
    const unsubscribe = ModalCtrl.subscribe(newModal => setModal({ ...newModal }))

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    isOpen: modal.open,
    open: ModalCtrl.open,
    close: ModalCtrl.close,
    setDefaultChain: OptionsCtrl.setSelectedChain
  }
}
