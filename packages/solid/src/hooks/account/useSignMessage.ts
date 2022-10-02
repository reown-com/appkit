import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useSignMessage(initialMessage?: string) {
  const {
    data: signature,
    refetch: sign,
    ...fetchResult
  } = useAsyncHookBuilder(
    async (message: string) => ClientCtrl.ethereum().signMessage(message),
    initialMessage
  )

  return {
    signature,
    sign,
    ...fetchResult
  }
}
