import { ClientCtrl } from '@web3modal/core'
import type { FetchEnsAvatarOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useFetchEnsAvatar(opts?: FetchEnsAvatarOpts) {
  const { data: avatar, ...fetchResult } = useAsyncHookBuilder(
    async (funcOpts: FetchEnsAvatarOpts) => {
      return ClientCtrl.ethereum().fetchEnsAvatar(funcOpts)
    },
    opts
  )

  return {
    avatar,
    ...fetchResult
  }
}
