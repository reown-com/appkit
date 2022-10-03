import type { BalanceCtrlFetchArgs } from '@web3modal/core'
import { BalanceCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Options = BalanceCtrlFetchArgs & {
  watch?: boolean
  enabled?: boolean
}

export function useBalance(options: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options)
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: BalanceCtrl.fetch,
    watchFn: BalanceCtrl.watch,
    args: chainAgnosticOptions
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
