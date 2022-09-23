import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

// -- utilities ---------------------------------------------------- //
const { fetchSigner } = ClientCtrl.ethereum()

// -- hook --------------------------------------------------------- //
export function useSigner() {
  const { ...result } = useAsyncHookBuilder(fetchSigner, undefined)

  return { ...result }
}
