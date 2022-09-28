import type { BlockCtrlFetchArgs } from '@web3modal/core'
import { BlockCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useStatefullAsyncController } from '../utils/useStatefullAsyncController'

type Options = BlockCtrlFetchArgs & {
  watch?: boolean
}

export function useBlockNumber(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options)
  const { data, onFetch, ...rest } = useStatefullAsyncController(BlockCtrl, chainAgnosticOptions)

  return {
    data: data.blockNumber,
    refetch: onFetch,
    ...rest
  }
}
