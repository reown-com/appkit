import { useSnapshot } from 'valtio'
import { AccountController } from '../src/controllers/AccountController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import { ChainController } from '../src/controllers/ChainController.js'
import { ConnectionController } from '../src/controllers/ConnectionController.js'
import type {
  AccountType,
  UseAppKitAccountReturn,
  UseAppKitNetworkReturn
} from '../src/utils/TypeUtil.js'
import { ConnectorController } from '../src/controllers/ConnectorController.js'

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
  const { status, user, preferredAccountType, smartAccountDeployed, allAccounts } = useSnapshot(
    AccountController.state
  )

  const { activeCaipAddress } = useSnapshot(ChainController.state)

  const authConnector = ConnectorController.getAuthConnector()

  return {
    allAccounts: allAccounts as AccountType[],
    caipAddress: activeCaipAddress,
    address: CoreHelperUtil.getPlainAddress(activeCaipAddress),
    isConnected: Boolean(activeCaipAddress),
    status,
    embeddedWalletInfo: authConnector
      ? {
          user,
          accountType: preferredAccountType,
          isSmartAccountDeployed: Boolean(smartAccountDeployed)
        }
      : undefined
  }
}

export function useDisconnect() {
  async function disconnect() {
    await ConnectionController.disconnect()
  }

  return { disconnect }
}
