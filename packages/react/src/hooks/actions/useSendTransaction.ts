import type { TransactionCtrlSendArgs } from '@web3modal/core'
import { TransactionCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

export function useSendTransaction(args: TransactionCtrlSendArgs) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: TransactionCtrl.send,
    args: {
      ...chainAgnosticArgs,
      enabled: false
    }
  })

  return {
    ...rest,
    sendTransaction: onFetch
  }
}
