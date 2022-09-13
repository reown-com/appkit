import { ClientCtrl } from '@web3modal/core'
import type { PrepareSendTransactionOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function usePrepareSendTransaction(opts: PrepareSendTransactionOpts) {
  const { data: transaction, ...fetchResult } = useAsyncHookBuilder(
    async (funcOpts: PrepareSendTransactionOpts) => {
      return ClientCtrl.ethereum().prepareSendTransaction(funcOpts)
    },
    opts
  )

  return {
    transaction,
    ...fetchResult
  }
}
