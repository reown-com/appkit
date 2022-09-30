import type { NetworkCtrlSwitchNetworkArgs } from '@web3modal/core'
import { NetworkCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'

export function useSwitchNetwork(args?: NetworkCtrlSwitchNetworkArgs) {
  const { onAction, ...rest } = useAsyncAction(NetworkCtrl.switchNetwork, {
    ...(args ?? { chainId: 1 }),
    enabled: false
  })

  return {
    switchNetwork: onAction,
    ...rest
  }
}
