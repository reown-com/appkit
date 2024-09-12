import { useSnapshot } from 'valtio'
import { AccountController } from '../src/controllers/AccountController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import { ChainController } from '../src/controllers/ChainController.js'

// -- Hooks ------------------------------------------------------------
export function useWeb3ModalNetwork() {
  const { activeCaipNetwork } = useSnapshot(ChainController.state)

  return {
    caipNetwork: activeCaipNetwork,
    chainId: activeCaipNetwork?.chainId
  }
}
export function useWeb3ModalAccount() {
  const { status } = useSnapshot(AccountController.state)
  const { activeCaipAddress } = useSnapshot(ChainController.state)

  return {
    address: CoreHelperUtil.getPlainAddress(activeCaipAddress),
    isConnected: activeCaipAddress ? true : false,
    status
  }
}
