import { ClientCtrl } from '@web3modal/core'
import type { FetchTransactionOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useFetchTransaction(opts: FetchTransactionOpts) {
  const { data: transaction, ...fetchResult } = useAsyncHookBuilder(
    async (funcOpts: FetchTransactionOpts) => {
      return ClientCtrl.ethereum().fetchTransaction(funcOpts)
    },
    opts
  )

  return {
    transaction,
    ...fetchResult
  }
}
