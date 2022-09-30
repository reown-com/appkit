import type { EnsCtrlFetchEnsAddressArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'

type Arguments = EnsCtrlFetchEnsAddressArgs & {
  enabled?: boolean
}

export function useEnsAddress(args: Arguments) {
  const { onAction, ...rest } = useAsyncAction(EnsCtrl.fetchEnsAddress, args)

  return {
    refetch: onAction,
    ...rest
  }
}
