import { ModalCtrl, OptionsCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useWeb3Modal() {
  const [modal, setModal] = useState(ModalCtrl.state)
  const [options, setOptions] = useState(OptionsCtrl.state)

  useEffect(() => {
    const unsubscribe = ModalCtrl.subscribe(newModal => setModal({ ...newModal }))

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const unsubscribe = OptionsCtrl.subscribe(newOptions => setOptions({ ...newOptions }))

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    isOpen: modal.open,
    open: ModalCtrl.open,
    close: ModalCtrl.close,
    selectedChain: options.selectedChain,
    setDefaultChain: OptionsCtrl.setSelectedChain
  }
}
