import type { EnsCtrlFetchEnsResolverArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'

type Arguments = EnsCtrlFetchEnsResolverArgs & {
  enabled?: boolean
}

export function useEnsResolver(args: Arguments) {
  const { onAction, ...rest } = useAsyncAction(EnsCtrl.fetchEnsResolver, args)

  return {
    refetch: onAction,
    ...rest
  }
}
