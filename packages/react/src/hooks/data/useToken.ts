import type { TokenCtrlFetchArgs } from '@web3modal/core'
import { TokenCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = TokenCtrlFetchArgs & {
  enabled?: boolean
}

export function useToken(args: Arguments) {
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: TokenCtrl.fetch,
    args: { ...chainAgnosticArgs, watch: false }
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
