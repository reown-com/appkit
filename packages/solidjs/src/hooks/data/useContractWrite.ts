import type { ContractCtrlReadArgs } from '@web3modal/core'
import { ContractCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = ContractCtrlReadArgs & {
  enabled?: boolean
  watch?: boolean
}

export function useContractWrite(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: ContractCtrl.read,
    watchFn: ContractCtrl.watchRead,
    args: chainAgnosticArgs
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
