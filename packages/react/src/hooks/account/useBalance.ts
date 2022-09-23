import { ClientCtrl } from '@web3modal/core'
import type { FetchBalanceArgs } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useBalance(...args: FetchBalanceArgs) {
  const { onAction: refetch, ...result } = useAsyncHookBuilder(
    ClientCtrl.ethereum().fetchBalance,
    ...args
  )

  return {
    ...result,
    refetch
  }
}
