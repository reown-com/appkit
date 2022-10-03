import type { TransactionCtrlSendArgs } from '@web3modal/core'
import { TransactionCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

export function useSendTransaction(args: TransactionCtrlSendArgs) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onAction, ...rest } = useAsyncAction(TransactionCtrl.send, {
    ...chainAgnosticArgs,
    enabled: false
  })

  return {
    sendTransaction: onAction,
    ...rest
  }
}
