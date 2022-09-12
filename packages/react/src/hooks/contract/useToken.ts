import { ClientCtrl } from '@web3modal/core'
import type { GetTokenOpts } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useToken() {
  const { data: token, ...fetchResults } = useAsyncHookBuilder(async (opts: GetTokenOpts) =>
    ClientCtrl.ethereum().getToken(opts)
  )

  return {
    token,
    ...fetchResults
  }
}
