import type { SignerCtrlSignMessageArgs } from '@web3modal/core'
import { SignerCtrl } from '@web3modal/core'
import { useAsyncController } from '../utils/useAsyncController'

export function useSignMessage(args: SignerCtrlSignMessageArgs) {
  const { onFetch, ...rest } = useAsyncController({
    fetchFn: SignerCtrl.signMessage,
    args: { ...args, enabled: false, watch: false }
  })

  return {
    ...rest,
    signMessage: onFetch
  }
}
