import type { EnsCtrlFetchEnsResolverArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = EnsCtrlFetchEnsResolverArgs & {
  enabled?: boolean
}

export function useEnsResolver(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: EnsCtrl.fetchEnsResolver,
    args: chainAgnosticArgs,
    hasRequiredArgs: Boolean(chainAgnosticArgs.name)
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
