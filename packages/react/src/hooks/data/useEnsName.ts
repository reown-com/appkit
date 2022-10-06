import type { EnsCtrlFetchEnsNameArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = EnsCtrlFetchEnsNameArgs & {
  enabled?: boolean
}

export function useEnsName(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: EnsCtrl.fetchEnsName,
    args: chainAgnosticArgs,
    hasRequiredArgs: Boolean(chainAgnosticArgs.address)
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
