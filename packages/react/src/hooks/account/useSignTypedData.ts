import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

// -- utilities ---------------------------------------------------- //
const { signTypedData: clientSignTypedData } = ClientCtrl.ethereum()
type Options = Parameters<typeof clientSignTypedData>[0]

// -- hook --------------------------------------------------------- //
export function useSignTypedData(options: Options) {
  const { callAction: signTypedData, ...result } = useAsyncHookBuilder(clientSignTypedData, options)

  return {
    signTypedData,
    ...result
  }
}
