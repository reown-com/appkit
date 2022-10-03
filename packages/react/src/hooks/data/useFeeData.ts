import type { FeeCtrlFetchArgs, FeeCtrlFetchReturnValue } from '@web3modal/core'
import { FeeCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useStaticAsyncController } from '../utils/useStaticAsyncController'

type Options = FeeCtrlFetchArgs & {
  watch?: boolean
  enabled?: boolean
}

export function useFeeData(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options ?? {})
  const { onFetch, ...rest } = useStaticAsyncController<FeeCtrlFetchReturnValue, Options>(
    FeeCtrl,
    chainAgnosticOptions
  )

  return {
    ...rest,
    refetch: onFetch
  }
}
