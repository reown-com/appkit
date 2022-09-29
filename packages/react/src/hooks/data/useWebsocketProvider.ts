import { WebSocketProviderCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useStaticWatchableController } from '../utils/useStaticWatchableController'

interface Options {
  chainId?: number
}

export function useWebsocketProvider(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options ?? {})
  const data = useStaticWatchableController(WebSocketProviderCtrl, chainAgnosticOptions)

  return data
}
