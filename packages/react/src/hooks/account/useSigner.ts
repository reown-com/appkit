import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useSigner() {
  const { ...result } = useAsyncHookBuilder(ClientCtrl.ethereum().fetchSigner, undefined)

  return { ...result }
}
