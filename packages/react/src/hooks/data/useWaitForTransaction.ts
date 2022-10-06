import type { TransactionCtrlWaitArgs } from '@web3modal/core'
import { TransactionCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = TransactionCtrlWaitArgs & {
  enabled?: boolean
}

export function useWaitForTransaction(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onFetch, data, isLoading, ...rest } = useAsyncController({
    fetchFn: TransactionCtrl.wait,
    args: chainAgnosticArgs,
    hasRequiredArgs: Boolean(chainAgnosticArgs.hash)
  })

  return {
    ...rest,
    receipt: data,
    isWaiting: isLoading,
    refetch: onFetch
  }
}
