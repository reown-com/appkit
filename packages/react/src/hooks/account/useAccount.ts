import { AccountCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'
import { useClientInitialized } from './useClientInitialized'

export function useAccount() {
  const [account, setAccount] = useState(AccountCtrl.state)
  const initialized = useClientInitialized()

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    const unsubscribe = AccountCtrl.subscribe(newAccount => setAccount({ ...newAccount }))
    if (initialized) unwatch = AccountCtrl.watch()

    return () => {
      unsubscribe()
      unwatch?.()
    }
  }, [initialized])

  return account
}
