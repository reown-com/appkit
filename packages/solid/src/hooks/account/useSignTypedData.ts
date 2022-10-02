import { ClientCtrl } from '@web3modal/core'
import type { SignTypedDataOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useSignTypedData(initialOpts?: SignTypedDataOpts) {
  const {
    data: signature,
    refetch: sign,
    ...fetchResult
  } = useAsyncHookBuilder(
    async (opts: SignTypedDataOpts) => ClientCtrl.ethereum().signTypedData(opts),
    initialOpts
  )

  return {
    signature,
    sign,
    ...fetchResult
  }
}
