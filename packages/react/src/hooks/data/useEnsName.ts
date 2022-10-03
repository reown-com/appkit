import type { EnsCtrlFetchEnsNameArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = EnsCtrlFetchEnsNameArgs & {
  enabled?: boolean
}

export function useEnsName(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onAction, ...rest } = useAsyncAction(EnsCtrl.fetchEnsName, chainAgnosticArgs)

  return {
    ...rest,
    refetch: onAction
  }
}
