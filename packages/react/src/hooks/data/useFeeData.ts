import type { FeeCtrlFetchArgs } from '@web3modal/core'
import { FeeCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Options = FeeCtrlFetchArgs & {
  watch?: boolean
  enabled?: boolean
}

export function useFeeData(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options ?? {})
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: FeeCtrl.fetch,
    watchFn: FeeCtrl.watch,
    args: chainAgnosticOptions
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
