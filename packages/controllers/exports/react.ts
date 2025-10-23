import { useCallback, useEffect, useState } from 'react'

import { useSnapshot } from 'valtio'

import { type ChainNamespace, type Connection, ConstantsUtil } from '@reown/appkit-common'

import { AlertController } from '../src/controllers/AlertController.js'
import { ApiController } from '../src/controllers/ApiController.js'
import { AssetController } from '../src/controllers/AssetController.js'
import { ChainController } from '../src/controllers/ChainController.js'
import { ConnectionController } from '../src/controllers/ConnectionController.js'
import { ConnectorController } from '../src/controllers/ConnectorController.js'
import { OptionsController } from '../src/controllers/OptionsController.js'
import { ProviderController } from '../src/controllers/ProviderController.js'
import { ConnectUtil, type WalletItem2 } from '../src/utils/ConnectUtil.js'
import { ConnectionControllerUtil } from '../src/utils/ConnectionControllerUtil.js'
import { ConnectorControllerUtil } from '../src/utils/ConnectorControllerUtil.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import type {
  NamespaceTypeMap,
  UseAppKitAccountReturn,
  UseAppKitNetworkReturn
} from '../src/utils/TypeUtil.js'
import { AssetUtil, StorageUtil } from './utils.js'

// -- Types ------------------------------------------------------------
export type { Connection } from '@reown/appkit-common'
export type { WalletItem2 } from '../src/utils/ConnectUtil.js'

interface DisconnectParams {
  id?: string
  namespace?: ChainNamespace
}

interface UseAppKitConnectionProps {
  namespace?: ChainNamespace
  onSuccess?: (params: {
    address: string
    namespace: ChainNamespace
    hasSwitchedAccount: boolean
    hasSwitchedWallet: boolean
    hasDeletedWallet: boolean
  }) => void
  onError?: (error: Error) => void
}

interface SwitchConnectionParams {
  connection: Connection
  address?: string
}

interface DeleteRecentConnectionProps {
  address: string
  connectorId: string
}

// -- Hooks ------------------------------------------------------------
export function useAppKitProvider<T>(chainNamespace: ChainNamespace) {
  const { providers, providerIds } = useSnapshot(ProviderController.state)

  const walletProvider = providers[chainNamespace] as T
  const walletProviderType = providerIds[chainNamespace]

  return {
    walletProvider,
    walletProviderType
  }
}

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
  const { activeConnectorIds } = useSnapshot(ConnectorController.state)
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
  const activeConnectorId = activeConnectorIds[chainNamespace]
  const connections = ConnectionController.getConnections(chainNamespace)
  const allAccounts = connections.flatMap(connection =>
    connection.accounts.map(({ address, type, publicKey }) =>
      CoreHelperUtil.createAccount(
        chainNamespace,
        address,
        (type || 'eoa') as NamespaceTypeMap[ChainNamespace],
        publicKey
      )
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
            accountType: chainAccountState?.preferredAccountType,
            isSmartAccountDeployed: Boolean(chainAccountState?.smartAccountDeployed)
          }
        : undefined
  }
}

export function useDisconnect() {
  async function disconnect(props?: DisconnectParams) {
    await ConnectionController.disconnect(props)
  }

  return { disconnect }
}

export function useAppKitConnections(namespace?: ChainNamespace) {
  // Snapshots to trigger re-renders on state changes
  useSnapshot(ConnectionController.state)
  useSnapshot(ConnectorController.state)
  useSnapshot(AssetController.state)

  const { activeChain } = useSnapshot(ChainController.state)
  const { remoteFeatures } = useSnapshot(OptionsController.state)

  const chainNamespace = namespace ?? activeChain

  const isMultiWalletEnabled = Boolean(remoteFeatures?.multiWallet)

  if (!chainNamespace) {
    throw new Error('No namespace found')
  }

  if (!isMultiWalletEnabled) {
    AlertController.open(
      ConstantsUtil.REMOTE_FEATURES_ALERTS.MULTI_WALLET_NOT_ENABLED.CONNECTIONS_HOOK,
      'info'
    )

    return {
      connections: [],
      recentConnections: []
    }
  }

  const { connections, recentConnections } =
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
    recentConnections: recentConnections.map(formatConnection)
  }
}

export function useAppKitConnection({ namespace, onSuccess, onError }: UseAppKitConnectionProps) {
  const { connections, isSwitchingConnection } = useSnapshot(ConnectionController.state)
  const { activeConnectorIds } = useSnapshot(ConnectorController.state)
  const { activeChain } = useSnapshot(ChainController.state)
  const { remoteFeatures } = useSnapshot(OptionsController.state)

  const chainNamespace = namespace ?? activeChain

  if (!chainNamespace) {
    throw new Error('No namespace found')
  }

  const isMultiWalletEnabled = Boolean(remoteFeatures?.multiWallet)

  if (!isMultiWalletEnabled) {
    AlertController.open(
      ConstantsUtil.REMOTE_FEATURES_ALERTS.MULTI_WALLET_NOT_ENABLED.CONNECTION_HOOK,
      'info'
    )

    return {
      connection: undefined,
      isPending: false,
      switchConnection: () => Promise.resolve(undefined),
      deleteConnection: () => ({})
    }
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
            hasSwitchedAccount,
            hasSwitchedWallet
          }) {
            onSuccess?.({
              address: newAddress,
              namespace: newNamespace,
              hasSwitchedAccount,
              hasSwitchedWallet,
              hasDeletedWallet: false
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
    ({ address, connectorId }: DeleteRecentConnectionProps) => {
      StorageUtil.deleteAddressFromConnection({ connectorId, address, namespace: chainNamespace })
      ConnectionController.syncStorageConnections()
      onSuccess?.({
        address,
        namespace: chainNamespace,
        hasSwitchedAccount: false,
        hasSwitchedWallet: false,
        hasDeletedWallet: true
      })
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

// -- Headless Connect Hook ---------------------------------
interface UseAppKitConnectOptions {
  /**
   * Optional namespace to filter wallets by chain.
   * If not provided, all wallets across all chains will be returned.
   */
  namespace?: ChainNamespace
  onHandleWcUri?: (uri: string) => void
}

export interface UseAppKitConnectReturn {
  /**
   * List of all wallets (injected connectors and WalletConnect wallets combined).
   * Each wallet has type and chains values so developers can build UI with better UX.
   * For example, they can render wallets with `recent` badge, just like AppKit does.
   */
  wallets: WalletItem2[]

  /**
   * Boolean that indicates if the user is currently connecting to a wallet.
   */
  isConnecting: boolean

  /**
   * Boolean that indicates if WalletConnect wallets are being fetched.
   */
  isFetchingWcWallets: boolean

  /**
   * Function to fetch WalletConnect wallets from the explorer API.
   * This is useful for pagination or initial load.
   * @param options - Options for fetching wallets
   * @param options.page - Page number to fetch (default: 1)
   */
  fetchWcWallets: (options?: { page?: number }) => Promise<void>

  /**
   * Function to connect to a wallet.
   * - For WalletConnect wallets: initiates WC connection and returns the URI in the onSuccess callback
   * - For injected connectors: triggers the extension/wallet directly
   *
   * @param wallet - The wallet item to connect to
   * @param callbacks - Success and error callbacks
   * @returns Promise that resolves when connection completes or rejects on error
   */
  connect: (wallet: WalletItem2, namespace?: ChainNamespace) => Promise<void>

  /**
   * The current WalletConnect URI for QR code display.
   * This is set when connecting to a WalletConnect wallet.
   */
  wcUri?: string

  /**
   * Function to clear the WalletConnect URI.
   */
  clearWcUri: () => void
}

/**
 * Headless hook for wallet connection.
 * Provides all the data and functions needed to build a custom connect UI.
 */
export function useAppKitConnect(options?: UseAppKitConnectOptions): UseAppKitConnectReturn {
  const connectorState = useSnapshot(ConnectorController.state)
  const apiState = useSnapshot(ApiController.state)
  const { status, wcUri } = useSnapshot(ConnectionController.state)

  useEffect(() => {
    if (wcUri) {
      options?.onHandleWcUri?.(wcUri)
    }
  }, [wcUri])

  const [isFetchingWcWallets, setIsFetchingWcWallets] = useState(false)

  const wallets = ConnectUtil.getUnifiedWalletList()

  void connectorState.connectors.length
  void apiState.wallets.length

  const isConnecting = status === 'connecting'

  const clearWcUri = useCallback(() => {
    ConnectionController.resetUri()
  }, [])

  /**
   * Fetch WalletConnect wallets from the explorer API
   */
  const fetchWcWallets = useCallback(async (fetchOptions?: { page?: number }) => {
    setIsFetchingWcWallets(true)
    try {
      await ApiController.fetchWalletsByPage({ page: fetchOptions?.page ?? 1 })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch WalletConnect wallets:', error)
    } finally {
      setIsFetchingWcWallets(false)
    }
  }, [])

  /**
   * Connect to a wallet
   */
  async function connect(_wallet: WalletItem2, namespace?: ChainNamespace) {
    const wallet = wallets.find(w => w.name === _wallet.name)
    const connector = wallet?.connectors.find(c => c.chain === namespace)

    const getConnector = ConnectorController.getConnector({
      id: connector?.id,
      rdns: connector?.rdns,
      namespace: namespace
    })

    if (_wallet.isInjected && getConnector) {
      await ConnectorControllerUtil.connectExternal(getConnector)
    } else {
      await ConnectionController.connectWalletConnect({ cache: 'never' })
    }
  }

  return {
    wallets,
    isConnecting,
    isFetchingWcWallets,
    fetchWcWallets,
    connect,
    wcUri,
    clearWcUri
  }
}
