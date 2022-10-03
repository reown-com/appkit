import type { BalanceCtrlFetchArgs, BalanceCtrlFetchReturnValue } from '@web3modal/core'
import { BalanceCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useStaticAsyncController } from '../utils/useStaticAsyncController'

type Options = BalanceCtrlFetchArgs & {
  watch?: boolean
  enabled?: boolean
}

export function useBalance(options: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options)
  const { onFetch, ...rest } = useStaticAsyncController<BalanceCtrlFetchReturnValue, Options>(
    BalanceCtrl,
    chainAgnosticOptions as Options
  )

  return {
    ...rest,
    refetch: onFetch
  }
}
