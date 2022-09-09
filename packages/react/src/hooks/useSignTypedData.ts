import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../utils/useAsyncHookBuilder'

export function useSignTypedData() {
  const {
    data: signature,
    refetch: sign,
    ...fetchResult
  } = useAsyncHookBuilder(ClientCtrl.ethereum().signTypedData)

  return {
    signature,
    sign,
    ...fetchResult
  }
}
