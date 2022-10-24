import { ProviderCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useController } from '../utils/useController'

interface Options {
  chainId?: number
}

export function useProvider(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options ?? {})
  const { data, isReady } = useController({
    getFn: ProviderCtrl.get,
    watchFn: ProviderCtrl.watch,
    args: chainAgnosticOptions
  })

  return { provider: data, isReady }
}
