import type { TransactionCtrlWaitArgs } from '@web3modal/core'
import { TransactionCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = TransactionCtrlWaitArgs & {
  enabled?: boolean
}

export function useWaitForTransaction(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onAction, data, isLoading, ...rest } = useAsyncAction(TransactionCtrl.wait, {
    ...chainAgnosticArgs
  })

  return {
    ...rest,
    receipt: data,
    isWaiting: isLoading,
    refetch: onAction
  }
}
