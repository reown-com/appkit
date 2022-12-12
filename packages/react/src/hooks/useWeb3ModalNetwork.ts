import { OptionsCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useWeb3ModalNetwork() {
  const [network, setNetwork] = useState(OptionsCtrl.state)

  useEffect(() => {
    const unsubscribe = OptionsCtrl.subscribe(newOptions => setNetwork({ ...newOptions }))

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    selectedChain: network.selectedChain,
    setSelectedChain: OptionsCtrl.setSelectedChain
  }
}
