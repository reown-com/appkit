import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useSignMessage() {
  const {
    data: signature,
    refetch: sign,
    ...fetchResult
  } = useAsyncHookBuilder(async (opts: string) => ClientCtrl.ethereum().signMessage(opts))

  return {
    signature,
    sign,
    ...fetchResult
  }
}
