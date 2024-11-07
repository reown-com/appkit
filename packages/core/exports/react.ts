import { useSnapshot } from 'valtio'
import { AccountController } from '../src/controllers/AccountController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import { ChainController } from '../src/controllers/ChainController.js'
import { ConnectionController } from '../src/controllers/ConnectionController.js'
import type { UseAppKitAccountReturn, UseAppKitNetworkReturn } from '../src/utils/TypeUtil.js'

// -- Hooks ------------------------------------------------------------
export function useAppKitNetworkCore(): Pick<
  UseAppKitNetworkReturn,
  'caipNetwork' | 'chainId' | 'caipNetworkId'
> {
  const { activeCaipNetwork } = useSnapshot(ChainController.state)

  return {
    caipNetwork: activeCaipNetwork,
    chainId: activeCaipNetwork?.id,
    caipNetworkId: activeCaipNetwork?.caipNetworkId
  }
}

export function useAppKitAccount(): UseAppKitAccountReturn {
  const { status } = useSnapshot(AccountController.state)
  const { activeCaipAddress } = useSnapshot(ChainController.state)

  return {
    caipAddress: activeCaipAddress,
    address: CoreHelperUtil.getPlainAddress(activeCaipAddress),
    isConnected: Boolean(activeCaipAddress),
    status
  }
}

export function useDisconnect() {
  async function disconnect() {
    await ConnectionController.disconnect()
  }

  return { disconnect }
}
