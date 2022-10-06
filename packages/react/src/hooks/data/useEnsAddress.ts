import type { EnsCtrlFetchEnsAddressArgs } from '@web3modal/core'
import { EnsCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = EnsCtrlFetchEnsAddressArgs & {
  enabled?: boolean
}

export function useEnsAddress(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: EnsCtrl.fetchEnsAddress,
    args: chainAgnosticArgs,
    hasRequiredArgs: Boolean(chainAgnosticArgs.name)
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
