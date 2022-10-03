import type { TransactionCtrlFetchArgs } from '@web3modal/core'
import { TransactionCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = TransactionCtrlFetchArgs & {
  enabled?: boolean
}

export function useTransaction(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onAction, ...rest } = useAsyncAction(TransactionCtrl.fetch, chainAgnosticArgs)

  return {
    ...rest,
    refetch: onAction
  }
}
