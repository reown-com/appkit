import { NetworkCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'
import { useClientInitialized } from './useClientInitialized'

export function useNetwork() {
  const [data, setData] = useState(NetworkCtrl.state)
  const initialized = useClientInitialized()

  useEffect(() => {
    let unWatch: (() => void) | undefined = undefined
    let unSubscribe: (() => void) | undefined = undefined
    if (initialized) {
      unSubscribe = NetworkCtrl.subscribe(newData => setData({ ...newData }))
      unWatch = NetworkCtrl.watch()
      NetworkCtrl.get()
    }

    return () => {
      unSubscribe?.()
      unWatch?.()
    }
  }, [initialized])

  return data
}
