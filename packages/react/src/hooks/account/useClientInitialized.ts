import { ClientCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useClientInitialized() {
  const [initialized, setInitialized] = useState(ClientCtrl.state.initialized)

  useEffect(() => {
    const unsubscribe = ClientCtrl.subscribe(newClient => setInitialized(newClient.initialized))

    return () => {
      unsubscribe()
    }
  }, [])

  return initialized
}
