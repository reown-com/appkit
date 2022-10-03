import { BlockCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

interface Options {
  watch?: boolean
  enabled?: boolean
  chainId?: number
}

export function useBlockNumber(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options ?? {})
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: BlockCtrl.fetch,
    watchFn: BlockCtrl.watch,
    args: chainAgnosticOptions
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
