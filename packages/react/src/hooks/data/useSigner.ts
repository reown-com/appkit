import { SignerCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

export function useSigner() {
  const chainAgnosticOptions = useChainAgnosticOptions({
    watch: true
  })
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: SignerCtrl.fetch,
    watchFn: SignerCtrl.watch,
    args: chainAgnosticOptions as never
  })

  return {
    ...rest,
    refetch: onFetch
  }
}
