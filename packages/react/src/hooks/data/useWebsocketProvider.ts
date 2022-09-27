import { WebSocketProviderCtrl } from '@web3modal/core'
import { useWatchableData } from '../utils/useWatchableData'

export function useWebSocketProvider() {
  const data = useWatchableData(WebSocketProviderCtrl, { watch: true })

  return data
}
