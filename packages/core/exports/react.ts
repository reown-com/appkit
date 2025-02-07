import { useSnapshot } from 'valtio'

import type { ChainNamespace } from '@reown/appkit-common'

import { AccountController } from '../src/controllers/AccountController.js'
import { ChainController } from '../src/controllers/ChainController.js'
import { ConnectionController } from '../src/controllers/ConnectionController.js'
import { ConnectorController } from '../src/controllers/ConnectorController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
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

export function useAppKitAccount(options?: {
  chainNamespace?: ChainNamespace
}): UseAppKitAccountReturn {
  const state = useSnapshot(ChainController.state)
  const chainNamespace = options?.chainNamespace || state.activeChain
  const activeChainsState = AccountController.state
  const chainAccountState = chainNamespace
    ? state.chains.get(chainNamespace)?.accountState || activeChainsState
    : activeChainsState

  const {
    user,
    allAccounts,
    caipAddress,
    status,
    preferredAccountType,
    smartAccountDeployed,
    socialProvider
  } = chainAccountState

  const authConnector = ConnectorController.getAuthConnector()

  return {
    allAccounts,
    caipAddress,
    address: CoreHelperUtil.getPlainAddress(caipAddress),
    isConnected: Boolean(caipAddress),
    status,
    embeddedWalletInfo: authConnector
      ? {
          user,
          authProvider: socialProvider || 'email',
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
