import { BlockCtrl } from '@web3modal/core'
import { useWatchableAsyncData } from '../utils/useWatchableAsyncData'

export function useBlockNumber() {
  const { data, onAction, ...rest } = useWatchableAsyncData(BlockCtrl, { watch: true })

  return {
    data: data.blockNumber,
    refetch: onAction,
    ...rest
  }
}
