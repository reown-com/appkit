import { AccountCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useAccount() {
  const [account, setAccount] = useState(AccountCtrl.state)

  useEffect(() => {
    const unsubscribe = AccountCtrl.subscribe(newAccount => setAccount({ ...newAccount }))

    return () => unsubscribe()
  }, [])

  return account
}
