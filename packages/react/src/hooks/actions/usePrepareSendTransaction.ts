import type { TransactionCtrlPrepareArgs } from '@web3modal/core'
import { TransactionCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

export function usePrepareSendTransaction(args: TransactionCtrlPrepareArgs) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onAction, ...rest } = useAsyncAction(TransactionCtrl.prepare, {
    ...chainAgnosticArgs,
    enabled: false
  })

  return {
    refetch: onAction,
    ...rest
  }
}
