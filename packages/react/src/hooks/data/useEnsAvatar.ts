import type { EnsCtrlFetchEnsAvatarArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = EnsCtrlFetchEnsAvatarArgs & {
  enabled?: boolean
}

export function useEnsAvatar(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onAction, ...rest } = useAsyncAction(EnsCtrl.fetchEnsAvatar, chainAgnosticArgs)

  return {
    ...rest,
    refetch: onAction
  }
}
