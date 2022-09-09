import { ClientCtrl } from '@web3modal/core'
import type { GetBalanceOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../utils/useAsyncHookBuilder'

export function useBalance() {
  const { data: balance, ...fetchResult } = useAsyncHookBuilder(async (opts: GetBalanceOpts) =>
    ClientCtrl.ethereum().fetchBalance(opts)
  )

  return {
    balance,
    ...fetchResult
  }
}
