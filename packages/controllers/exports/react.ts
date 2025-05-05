import { useSnapshot } from 'valtio'

import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'

import { ChainController } from '../src/controllers/ChainController.js'
import { ConnectionController } from '../src/controllers/ConnectionController.js'
import { ConnectorController } from '../src/controllers/ConnectorController.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import type { UseAppKitAccountReturn, UseAppKitNetworkReturn } from '../src/utils/TypeUtil.js'
import { StorageUtil } from './utils.js'

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

export function useAppKitAccount(options?: { namespace?: ChainNamespace }): UseAppKitAccountReturn {
  const state = useSnapshot(ChainController.state)
  const chainNamespace = options?.namespace || state.activeChain

  if (!chainNamespace) {
    return {
      allAccounts: [],
      address: undefined,
      caipAddress: undefined,
      status: undefined,
      isConnected: false,
      embeddedWalletInfo: undefined
    }
  }

  const chainAccountState = state.chains.get(chainNamespace)?.accountState
  const authConnector = ConnectorController.getAuthConnector(chainNamespace)
  const activeConnectorId = StorageUtil.getConnectedConnectorId(chainNamespace)

  return {
    allAccounts: chainAccountState?.allAccounts || [],
    caipAddress: chainAccountState?.caipAddress,
    address: CoreHelperUtil.getPlainAddress(chainAccountState?.caipAddress),
    isConnected: Boolean(chainAccountState?.caipAddress),
    status: chainAccountState?.status,
    embeddedWalletInfo:
      authConnector && activeConnectorId === ConstantsUtil.CONNECTOR_ID.AUTH
        ? {
            user: chainAccountState?.user
              ? {
                  ...chainAccountState.user,
                  /*
                   * Getting the username from the chain controller works well for social logins,
                   * but Farcaster uses a different connection flow and doesn’t emit the username via events.
                   * Since the username is stored in local storage before the chain controller updates,
                   * it’s safe to use the local storage value here.
                   */
                  username: StorageUtil.getConnectedSocialUsername()
                }
              : undefined,
            authProvider: chainAccountState?.socialProvider || 'email',
            accountType: chainAccountState?.preferredAccountTypes?.[chainNamespace],
            isSmartAccountDeployed: Boolean(chainAccountState?.smartAccountDeployed)
          }
        : undefined
  }
}

export function useDisconnect() {
  async function disconnect(props?: { namespace?: ChainNamespace }) {
    await ConnectionController.disconnect(props?.namespace)
  }

  return { disconnect }
}
