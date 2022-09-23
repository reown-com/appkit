import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

// -- utilities ---------------------------------------------------- //
const { fetchBalance } = ClientCtrl.ethereum()
type Options = Parameters<typeof fetchBalance>[0]

// -- hook --------------------------------------------------------- //
export function useBalance(options: Options) {
  const { callAction: refetch, ...result } = useAsyncHookBuilder(fetchBalance, options)

  return {
    ...result,
    refetch
  }
}
