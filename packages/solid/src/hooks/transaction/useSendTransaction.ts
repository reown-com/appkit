import { ClientCtrl } from '@web3modal/core'
import type { SendTransactionOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useSendTransaction(initialOpts?: SendTransactionOpts) {
  const { data: transaction, ...fetchResult } = useAsyncHookBuilder(
    async (funcOpts: SendTransactionOpts) => {
      return ClientCtrl.ethereum().sendTransaction(funcOpts)
    },
    initialOpts
  )

  return {
    transaction,
    ...fetchResult
  }
}
