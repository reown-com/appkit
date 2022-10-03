import type { NetworkCtrlSwitchNetworkArgs } from '@web3modal/core'
import { NetworkCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

export function useSwitchNetwork(args?: NetworkCtrlSwitchNetworkArgs) {
  const chainAgnosticArgs = useChainAgnosticOptions(args ?? {})
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: NetworkCtrl.switchNetwork,
    args: { ...chainAgnosticArgs, enabled: false }
  })

  return {
    ...rest,
    switchNetwork: onFetch
  }
}
