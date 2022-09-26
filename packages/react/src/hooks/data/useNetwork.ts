import { NetworkCtrl } from '@web3modal/core'
import { useWatchableData } from '../../utils/useWatchableData'

export function useAccount() {
  const data = useWatchableData(NetworkCtrl, true)

  return data
}
