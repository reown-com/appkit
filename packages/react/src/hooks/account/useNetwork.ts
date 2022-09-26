import { NetworkCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

// -- hook --------------------------------------------------------- //
export function useNetwork() {
  const [network, setNetwork] = useState(NetworkCtrl.state)

  useEffect(() => {
    const unsubscribe = NetworkCtrl.subscribe(newNetwork => setNetwork({ ...newNetwork }))

    return () => unsubscribe()
  }, [])

  return network
}
