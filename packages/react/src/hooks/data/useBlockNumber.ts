import { BlockCtrl } from '@web3modal/core'
import { useWatchableAsyncData } from '../utils/useWatchableAsyncData'

interface Options {
  watch?: boolean
  chainId?: number
}

export function useBlockNumber(options?: Options) {
  const { data, onAction, ...rest } = useWatchableAsyncData(BlockCtrl, { watch: options?.watch })

  return {
    data: data.blockNumber,
    refetch: onAction,
    ...rest
  }
}
