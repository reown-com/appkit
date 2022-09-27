import { BlockCtrl } from '@web3modal/core'
import { useWatchableAsyncData } from '../utils/useWatchableAsyncData'

export function useBlockNumber() {
  const { data, onAction, ...rest } = useWatchableAsyncData(BlockCtrl)

  return {
    data: data.blockNumber,
    refetch: onAction,
    ...rest
  }
}
