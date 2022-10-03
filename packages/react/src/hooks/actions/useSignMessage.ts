import type { SignerCtrlSignMessageArgs } from '@web3modal/core'
import { SignerCtrl } from '@web3modal/core'
import { useAsyncAction } from '../utils/useAsyncAction'

export function useSignMessage(args: SignerCtrlSignMessageArgs) {
  const { onAction, ...rest } = useAsyncAction(SignerCtrl.signMessage, { ...args, enabled: false })

  return {
    ...rest,
    signMessage: onAction
  }
}
