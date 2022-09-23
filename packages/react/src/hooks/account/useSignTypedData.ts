import { ClientCtrl } from '@web3modal/core'
import type { SignTypedDataArgs } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useSignTypedData(...args: SignTypedDataArgs) {
  const { callAction: signTypedData, ...result } = useAsyncHookBuilder(
    ClientCtrl.ethereum().signTypedData,
    ...args
  )

  return {
    signTypedData,
    ...result
  }
}
