import { ProviderCtrl } from '@web3modal/core'
import { useWatchableData } from '../utils/useWatchableData'

export function useProvider() {
  const data = useWatchableData(ProviderCtrl)

  return data
}
