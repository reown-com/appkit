import { useSnapshot } from 'valtio'
import { NetworkController } from '../src/controllers/NetworkController.js'
import { AccountController } from '../src/controllers/AccountController.js'

// -- Hooks ------------------------------------------------------------
export function useWeb3ModalNetwork() {
  const { caipNetwork } = useSnapshot(NetworkController.state)

  return {
    caipNetwork,
    chainId: caipNetwork?.chainId
  }
}
export function useWeb3ModalAccount() {
  const { address, isConnected, status } = useSnapshot(AccountController.state)

  return {
    address,
    isConnected,
    status
  }
}
