import type { BalanceCtrlFetchArgs, BalanceCtrlReturnValue } from '@web3modal/core'
import { BalanceCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useStaticAsyncController } from '../utils/useStaticAsyncController'

type Options = BalanceCtrlFetchArgs & {
  watch?: boolean
  enabled?: boolean
}

export function useBalance(options: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options)
  const { onFetch, ...rest } = useStaticAsyncController<BalanceCtrlReturnValue, Options>(
    BalanceCtrl,
    chainAgnosticOptions
  )

  return {
    refetch: onFetch,
    ...rest
  }
}
