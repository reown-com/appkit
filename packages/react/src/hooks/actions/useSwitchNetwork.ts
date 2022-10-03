import type { NetworkCtrlSwitchNetworkArgs } from '@web3modal/core'
import { NetworkCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

export function useSwitchNetwork(args?: NetworkCtrlSwitchNetworkArgs) {
  const chainAgnosticArgs = useChainAgnosticOptions(args ?? {})
  const { onAction, ...rest } = useAsyncAction(NetworkCtrl.switchNetwork, {
    ...chainAgnosticArgs,
    enabled: false
  })

  return {
    ...rest,
    switchNetwork: onAction
  }
}
