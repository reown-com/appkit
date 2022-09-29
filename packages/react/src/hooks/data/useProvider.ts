import { ProviderCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useStaticWatchableController } from '../utils/useStaticWatchableController'

interface Options {
  chainId?: number
}

export function useProvider(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options ?? {})
  const data = useStaticWatchableController(ProviderCtrl, chainAgnosticOptions)

  return data
}
