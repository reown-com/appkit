import type { SignerCtrlSignTypedDataArgs } from '@web3modal/core'
import { SignerCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'

export function useSignTypedData(args: SignerCtrlSignTypedDataArgs) {
  const { onAction, ...rest } = useAsyncAction(SignerCtrl.signTypedData, args)

  return {
    signMessage: onAction,
    ...rest
  }
}
