import type { EnsCtrlFetchEnsAddressArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = EnsCtrlFetchEnsAddressArgs & {
  enabled?: boolean
}

export function useEnsAddress(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onAction, ...rest } = useAsyncAction(EnsCtrl.fetchEnsAddress, chainAgnosticArgs)

  return {
    ...rest,
    refetch: onAction
  }
}
