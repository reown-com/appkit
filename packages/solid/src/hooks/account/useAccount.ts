import type { Account } from '@web3modal/core'
import { AccountCtrl, initialAccountlState } from '@web3modal/core'
import { createEffect } from 'solid-js'
import { createStore } from 'solid-js/store'

export function useAccount() {
  const [account, setAccount] = createStore<Account>(initialAccountlState)

  createEffect(() => {
    setAccount(AccountCtrl.state)
    const unsubscribe = AccountCtrl.subscribe(newAccount => setAccount(() => ({ ...newAccount })))

    return () => unsubscribe()
  })

  return account
}
