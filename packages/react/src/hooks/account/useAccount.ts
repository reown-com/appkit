import type { Account } from '@web3modal/core'
import { AccountCtrl, initialAccountlState } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useAccount() {
  const [account, setAccount] = useState<Account>(initialAccountlState)

  useEffect(() => {
    setAccount(AccountCtrl.state)
    const unsubscribe = AccountCtrl.subscribe(newAccount => setAccount({ ...newAccount }))

    return () => unsubscribe()
  }, [])

  return account
}
