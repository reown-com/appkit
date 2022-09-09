import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../utils/useAsyncHookBuilder'

export function useSigner() {
  const { data: signer, ...fetchResult } = useAsyncHookBuilder(async () =>
    ClientCtrl.ethereum().fetchSigner()
  )

  return { signer, ...fetchResult }
}
