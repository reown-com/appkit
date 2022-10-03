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
  const { onFetch, ...rest } = useStaticAsyncWatchableController(BlockCtrl, chainAgnosticOptions)

  return {
    ...rest,
    refetch: onFetch
  }
}
