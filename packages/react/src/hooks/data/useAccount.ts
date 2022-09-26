import { AccountCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'
import { useClientInitialized } from '../../utils/useClientInitialized'

export function useAccount() {
  const [account, setAccount] = useState(AccountCtrl.state)
  const initialized = useClientInitialized()

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    let unsubscribe: (() => void) | undefined = undefined
    if (initialized) {
      unsubscribe = AccountCtrl.subscribe(newAccount => setAccount({ ...newAccount }))
      unwatch = AccountCtrl.watch()
    }

    return () => {
      unsubscribe?.()
      unwatch?.()
    }
  }, [initialized])

  return account
}
