import type { EnsCtrlFetchEnsNameArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'

type Arguments = EnsCtrlFetchEnsNameArgs & {
  enabled?: boolean
}

export function useEnsName(args: Arguments) {
  const { onAction, ...rest } = useAsyncAction(EnsCtrl.fetchEnsName, args)

  return {
    refetch: onAction,
    ...rest
  }
}
