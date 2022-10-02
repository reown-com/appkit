import type { Account } from '@web3modal/core'
import { AccountCtrl, initialAccountlState } from '@web3modal/core'
import { createEffect, createSignal } from 'solid-js'

export function useAccount() {
  const [account, setAccount] = createSignal<Account>(initialAccountlState)

  createEffect(() => {
    setAccount(AccountCtrl.state)
    const unsubscribe = AccountCtrl.subscribe(newAccount => setAccount({ ...newAccount }))

    return () => unsubscribe()
  })

  return account
}
