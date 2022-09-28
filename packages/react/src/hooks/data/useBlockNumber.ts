import type { BlockCtrlFetchArgs } from '@web3modal/core'
import { BlockCtrl } from '@web3modal/core'
import { useStatefullAsyncController } from '../utils/useStatefullAsyncController'

type Options = BlockCtrlFetchArgs & {
  watch?: boolean
}

export function useBlockNumber(options?: Options) {
  const { data, onFetch, ...rest } = useStatefullAsyncController(BlockCtrl, options)

  return {
    data: data.blockNumber,
    refetch: onFetch,
    ...rest
  }
}
