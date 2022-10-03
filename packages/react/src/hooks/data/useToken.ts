import type { TokenCtrlFetchArgs } from '@web3modal/core'
import { TokenCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = TokenCtrlFetchArgs & {
  enabled?: boolean
}

export function useToken(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onAction, ...rest } = useAsyncAction(TokenCtrl.fetch, chainAgnosticArgs)

  return {
    ...rest,
    refetch: onAction
  }
}
