import type { EnsCtrlFetchEnsResolverArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = EnsCtrlFetchEnsResolverArgs & {
  enabled?: boolean
}

export function useEnsResolver(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onAction, ...rest } = useAsyncAction(EnsCtrl.fetchEnsResolver, chainAgnosticArgs)

  return {
    refetch: onAction,
    ...rest
  }
}
