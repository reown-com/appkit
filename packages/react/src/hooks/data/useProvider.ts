import { ProviderCtrl } from '@web3modal/core'
import { useWatchableData } from '../utils/useWatchableData'

export function useProvider() {
  const data = useWatchableData(ProviderCtrl, { watch: true })

  return data
}
