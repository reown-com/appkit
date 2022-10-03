import { SignerCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

interface Options {
  chainId?: number
}

export function useSigner(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions({
    ...options,
    watch: true
  })
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: SignerCtrl.fetch,
    watchFn: SignerCtrl.watch,
    args: chainAgnosticOptions
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
