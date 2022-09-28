import { WebSocketProviderCtrl } from '@web3modal/core'
import { useStatefullController } from '../utils/useStatefullController'

export function useWebSocketProvider() {
  const data = useStatefullController(WebSocketProviderCtrl)

  return data
}
