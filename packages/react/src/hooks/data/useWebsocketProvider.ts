import { WebSocketProviderCtrl } from '@web3modal/core'
import { useStatefullController } from '../utils/useStatefullController'

export function useWebsocketProvider() {
  const data = useStatefullController(WebSocketProviderCtrl)

  return data
}
