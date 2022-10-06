import type { EnsCtrlFetchEnsAvatarArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = EnsCtrlFetchEnsAvatarArgs & {
  enabled?: boolean
}

export function useEnsAvatar(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: EnsCtrl.fetchEnsAvatar,
    args: chainAgnosticArgs,
    hasRequiredArgs: Boolean(chainAgnosticArgs.addressOrName)
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
