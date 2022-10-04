import { ProviderCtrl } from '@web3modal/core'
import { useController } from '../utils/useController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

interface Options {
  chainId?: number
}

export function useProvider(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options ?? {})
  const { data } = useController({
    getFn: ProviderCtrl.get,
    watchFn: ProviderCtrl.watch,
    args: chainAgnosticOptions
  })

  return data
}
