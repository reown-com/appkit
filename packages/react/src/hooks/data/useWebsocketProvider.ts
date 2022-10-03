import { WebSocketProviderCtrl } from '@web3modal/core'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useController } from '../utils/useController'

interface Options {
  chainId?: number
}

export function useWebsocketProvider(options?: Options) {
  const chainAgnosticOptions = useChainAgnosticOptions(options ?? {})
  const { data } = useController({
    getFn: WebSocketProviderCtrl.get,
    watchFn: WebSocketProviderCtrl.watch,
    args: chainAgnosticOptions
  })

  return data
}
