import { ClientCtrl } from '@web3modal/core'
import type { FetchBalanceArgs } from '@web3modal/ethereum'
import { useAsyncHookBuilder } from '../../utils/useAsyncHookBuilder'

export function useBalance({ addressOrName, chainId, formatUnits, token }: FetchBalanceArgs) {
  const { onAction: refetch, ...result } = useAsyncHookBuilder(ClientCtrl.ethereum().fetchBalance, {
    addressOrName,
    chainId,
    formatUnits,
    token
  })

  return {
    ...result,
    refetch
  }
}
