import { useCallback, useState } from 'react'

import { useSnapshot } from 'valtio'

import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'

import { AssetController } from '../src/controllers/AssetController.js'
import { ChainController } from '../src/controllers/ChainController.js'
import { type Connection, ConnectionController } from '../src/controllers/ConnectionController.js'
import { ConnectorController } from '../src/controllers/ConnectorController.js'
import { ConnectionControllerUtil } from '../src/utils/ConnectionControllerUtil.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import type { UseAppKitAccountReturn, UseAppKitNetworkReturn } from '../src/utils/TypeUtil.js'
import { AssetUtil, StorageUtil } from './utils.js'

// -- Types ------------------------------------------------------------
export type { Connection } from '../src/controllers/ConnectionController.js'

interface UseAppKitConnectionProps {
  namespace?: ChainNamespace
  onSuccess?: (params: {
    address: string
    namespace: ChainNamespace
    isAccountSwitched: boolean
    isWalletSwitched: boolean
    isWalletDeleted: boolean
  }) => void
  onError?: (error: Error) => void
}

interface SwitchConnectionParams {
  connection: Connection
  address?: string
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
  async function disconnect(props?: { connectorId?: string; namespace?: ChainNamespace }) {
    await ConnectionController.disconnect({ id: props?.connectorId, namespace: props?.namespace })
  }

  return { disconnect }
}

export function useAppKitConnections(namespace?: ChainNamespace) {
  // Snapshots to trigger re-renders on state changes
  useSnapshot(ConnectionController.state)
  useSnapshot(ConnectorController.state)
  useSnapshot(AssetController.state)

  const { activeChain } = useSnapshot(ChainController.state)

  const chainNamespace = namespace ?? activeChain

  if (!chainNamespace) {
    throw new Error('No namespace found')
  }

  const { connections, storageConnections } =
    ConnectionControllerUtil.getConnectionsData(chainNamespace)

  const formatConnection = useCallback((connection: Connection) => {
    const connector = ConnectorController.getConnectorById(connection.connectorId)

    const name = ConnectorController.getConnectorName(connector?.name)
    const icon = AssetUtil.getConnectorImage(connector)
    const networkImage = AssetUtil.getNetworkImage(connection.caipNetwork)

    return {
      name,
      icon,
      networkIcon: networkImage,
      ...connection
    }
  }, [])

  return {
    connections: connections.map(formatConnection),
    storageConnections: storageConnections.map(formatConnection)
  }
}

export function useAppKitConnection({ namespace, onSuccess, onError }: UseAppKitConnectionProps) {
  const [, forceUpdate] = useState(0)

  const { connections, isSwitchingConnection } = useSnapshot(ConnectionController.state)
  const { activeConnectorIds } = useSnapshot(ConnectorController.state)
  const { activeChain } = useSnapshot(ChainController.state)

  const chainNamespace = namespace ?? activeChain

  if (!chainNamespace) {
    throw new Error('No namespace found')
  }

  const connectorId = activeConnectorIds[chainNamespace]
  const connList = connections.get(chainNamespace)
  const connection = connList?.find(c => c.connectorId.toLowerCase() === connectorId?.toLowerCase())

  const switchConnection = useCallback(
    async ({ connection: _connection, address }: SwitchConnectionParams) => {
      try {
        ConnectionController.setIsSwitchingConnection(true)

        await ConnectionController.switchConnection({
          connection: _connection,
          address,
          namespace: chainNamespace,
          onChange({
            address: newAddress,
            namespace: newNamespace,
            isAccountSwitched,
            isWalletSwitched
          }) {
            onSuccess?.({
              address: newAddress,
              namespace: newNamespace,
              isAccountSwitched,
              isWalletSwitched,
              isWalletDeleted: false
            })
          }
        })
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Something went wrong')
        onError?.(error)
      } finally {
        ConnectionController.setIsSwitchingConnection(false)
      }
    },
    [chainNamespace, onSuccess, onError]
  )

  const deleteConnection = useCallback(
    ({ address, connectorId }: UseAppKitConnectionDeleteRecentConnectionProps) => {
      StorageUtil.deleteAddressFromConnection({ connectorId, address, namespace: chainNamespace })
      onSuccess?.({
        address,
        namespace: chainNamespace,
        isAccountSwitched: false,
        isWalletSwitched: false,
        isWalletDeleted: true
      })
      forceUpdate(prev => prev + 1)
    },
    [chainNamespace]
  )

  return {
    connection,
    isPending: isSwitchingConnection,
    switchConnection,
    deleteConnection
  }
}
