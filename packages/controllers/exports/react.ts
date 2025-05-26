import { useState } from 'react'

import { useSnapshot } from 'valtio'

import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'

import { ChainController } from '../src/controllers/ChainController.js'
import { type Connection, ConnectionController } from '../src/controllers/ConnectionController.js'
import { ConnectorController } from '../src/controllers/ConnectorController.js'
import { ConnectionControllerUtil } from '../src/utils/ConnectionControllerUtil.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import type { UseAppKitAccountReturn, UseAppKitNetworkReturn } from '../src/utils/TypeUtil.js'
import { StorageUtil } from './utils.js'

// -- Types ------------------------------------------------------------
interface UseAppKitConnectionProps {
  namespace?: ChainNamespace
  onConnect?: () => void
  onDisconnect?: () => void
  onDeleteRecentConnection?: () => void
}

interface UseAppKitConnectionConnectProps {
  connection: Connection
  address: string
}

interface UseAppKitConnectionDisconnectProps {
  connection: Connection
}

interface UseAppKitConnectionDeleteRecentConnectionProps {
  address: string
  connectorId: string
}

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
  const connections = ConnectionController.state.connections.get(chainNamespace) ?? []
  const allAccounts = connections.flatMap(connection =>
    connection.accounts.map(({ address }) =>
      CoreHelperUtil.createAccount(chainNamespace, address, 'eoa')
    )
  )

  return {
    allAccounts,
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
    await ConnectionController.disconnect({ namespace: props?.namespace })
  }

  return { disconnect }
}

export function useAppKitConnection({
  namespace,
  onDisconnect,
  onDeleteRecentConnection
}: UseAppKitConnectionProps) {
  // Used to force a re-render when the storage connection changes
  const [, setBool] = useState(false)

  // Force re-renders when the connection or connector state changes
  useSnapshot(ConnectionController.state)
  useSnapshot(ConnectorController.state)

  const { activeChain } = useSnapshot(ChainController.state)

  const chainNamespace = namespace || activeChain

  if (!chainNamespace) {
    throw new Error('No namespace found')
  }

  const { connections, storageConnections } =
    ConnectionControllerUtil.getConnectionsData(chainNamespace)

  async function connect({ connection, address }: UseAppKitConnectionConnectProps) {
    if (!chainNamespace) {
      throw new Error('No namespace found')
    }

    await ConnectionController.switchConnection({
      connection,
      address,
      namespace: chainNamespace
    })
  }

  async function disconnect({ connection }: UseAppKitConnectionDisconnectProps) {
    if (!chainNamespace) {
      throw new Error('No namespace found')
    }

    await ConnectionController.disconnect({ id: connection.connectorId, namespace: chainNamespace })

    onDisconnect?.()
  }

  function deleteRecentConnection({
    address,
    connectorId
  }: UseAppKitConnectionDeleteRecentConnectionProps) {
    if (!chainNamespace) {
      throw new Error('No namespace found')
    }

    StorageUtil.deleteAddressFromConnection({
      connectorId,
      address,
      namespace: chainNamespace
    })

    onDeleteRecentConnection?.()

    // Force re-render when the storage connection changes
    setBool(prev => !prev)
  }

  return {
    connections,
    storageConnections,
    connect,
    disconnect,
    deleteRecentConnection
  }
}
