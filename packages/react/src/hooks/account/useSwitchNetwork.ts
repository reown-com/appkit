import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

// -- utilities ---------------------------------------------------- //
const { switchNetwork: clientSwitchNetwork } = ClientCtrl.ethereum()
type Options = Parameters<typeof clientSwitchNetwork>[0]

// -- hook --------------------------------------------------------- //
export function useSwitchNetwork(options: Options) {
  const { callAction: switchNetwork, ...result } = useAsyncHookBuilder(clientSwitchNetwork, options)

  return {
    switchNetwork,
    ...result
  }
}
