import { ClientCtrl } from '@web3modal/core'
import type { SignMessageArgs } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useSignMessage(...args: SignMessageArgs) {
  const { callAction: signMessage, ...result } = useAsyncHookBuilder(
    ClientCtrl.ethereum().signMessage,
    ...args
  )

  return {
    signMessage,
    ...result
  }
}
