import type { TransactionCtrlFetchArgs } from '@web3modal/core'
import { TransactionCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = TransactionCtrlFetchArgs & {
  enabled?: boolean
}

export function useTransaction(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: TransactionCtrl.fetch,
    args: chainAgnosticArgs
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
