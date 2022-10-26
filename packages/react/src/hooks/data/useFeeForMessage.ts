import type { FeeCtrlFetchFeeForMessage } from '@web3modal/core'
import { FeeCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'

type Options = FeeCtrlFetchFeeForMessage

export function useFeeForMessage(options: Options) {
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: async (args: FeeCtrlFetchFeeForMessage) =>
      FeeCtrl.fetchFeeForMessage('transfer', args),
    args: { ...options, enabled: true }
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
