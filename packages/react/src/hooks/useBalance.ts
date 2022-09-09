import { ClientCtrl } from '@web3modal/core'
import { useAsyncHookBuilder } from '../utils/useAsyncHookBuilder'

export function useBalance() {
  const { data: balance, ...fetchResult } = useAsyncHookBuilder(ClientCtrl.ethereum().fetchBalance)

  return {
    balance,
    ...fetchResult
  }
}
