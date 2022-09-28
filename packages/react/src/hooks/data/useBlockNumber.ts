import type { BlockCtrlFetchArgs } from '@web3modal/core'
import { BlockCtrl } from '@web3modal/core'
import { useWatchableAsyncData } from '../utils/useWatchableAsyncData'

type Options = BlockCtrlFetchArgs & {
  watch?: boolean
}

export function useBlockNumber(options?: Options) {
  const { data, onAction, ...rest } = useWatchableAsyncData(BlockCtrl, options)

  return {
    data: data.blockNumber,
    refetch: onAction,
    ...rest
  }
}
