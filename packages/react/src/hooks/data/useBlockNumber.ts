import { BlockCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useStaticAsyncWatchableController } from '../utils/useStaticAsyncWatchableController'

interface Options {
  watch?: boolean
  enabled?: boolean
  chainId?: number
}

export function useBlockNumber(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options ?? {})
  const { data, onFetch, ...rest } = useStaticAsyncWatchableController(
    BlockCtrl,
    chainAgnosticOptions
  )

  return {
    data,
    refetch: onFetch,
    ...rest
  }
}
