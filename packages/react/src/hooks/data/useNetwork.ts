import { NetworkCtrl } from '@web3modal/core'
import { useWatchableData } from '../../utils/useWatchableData'

export function useNetwork() {
  const data = useWatchableData(NetworkCtrl, true)

  return data
}
