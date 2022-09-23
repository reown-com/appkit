import { ClientCtrl } from '@web3modal/core'
import type { SwitchNetworkArgs } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useSwitchNetwork(...args: SwitchNetworkArgs) {
  const { callAction: switchNetwork, ...result } = useAsyncHookBuilder(
    ClientCtrl.ethereum().switchNetwork,
    ...args
  )

  return {
    switchNetwork,
    ...result
  }
}
