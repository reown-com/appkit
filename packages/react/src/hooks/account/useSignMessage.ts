import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

const { signMessage: clientSignMessage } = ClientCtrl.ethereum()
type Options = Parameters<typeof clientSignMessage>[0]

export function useSignMessage(options: Options) {
  const { callAction: signMessage, ...result } = useAsyncHookBuilder(clientSignMessage, options)

  return {
    signMessage,
    ...result
  }
}
