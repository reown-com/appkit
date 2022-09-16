import { ClientCtrl } from '@web3modal/core'
import type { WaitForTransactionOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useWaitForTransaction(opts: WaitForTransactionOpts) {
  const { data: transaction, ...fetchResult } = useAsyncHookBuilder(
    async (funcOpts: WaitForTransactionOpts) => {
      return ClientCtrl.ethereum().waitForTransaction(funcOpts)
    },
    opts
  )

  return {
    transaction,
    ...fetchResult
  }
}
