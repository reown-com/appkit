import { SignerCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useStaticAsyncWatchableController } from '../utils/useStaticAsyncWatchableController'

interface Options {
  chainId?: number
}

export function useSigner(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions({
    ...options,
    watch: true,
    forceInitialFetch: true
  })
  const { data, onFetch, ...rest } = useStaticAsyncWatchableController(
    SignerCtrl,
    chainAgnosticOptions
  )

  return {
    data,
    refetch: onFetch,
    ...rest
  }
}
