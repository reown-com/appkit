import type { SignerCtrlSignTypedDataArgs } from '@web3modal/core'
import { SignerCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'

export function useSignTypedData(args: SignerCtrlSignTypedDataArgs) {
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: SignerCtrl.signTypedData,
    args: { ...args, enabled: false }
  })

  return {
    ...rest,
    signTypedData: onFetch
  }
}
