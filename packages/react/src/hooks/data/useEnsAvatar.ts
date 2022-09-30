import type { EnsCtrlFetchEnsAvatarArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'

type Arguments = EnsCtrlFetchEnsAvatarArgs & {
  enabled?: boolean
}

export function useEnsAvatar(args: Arguments) {
  const { onAction, ...rest } = useAsyncAction(EnsCtrl.fetchEnsAvatar, args)

  return {
    refetch: onAction,
    ...rest
  }
}
