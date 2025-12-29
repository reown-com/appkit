import { useCallback, useEffect, useRef, useState } from 'react'

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
import { PublicStateController } from '../src/controllers/PublicStateController.js'
import { ApiControllerUtil } from '../src/utils/ApiControllerUtil.js'
import { ConnectUtil, type WalletItem } from '../src/utils/ConnectUtil.js'
import { ConnectionControllerUtil } from '../src/utils/ConnectionControllerUtil.js'
import { ConnectorControllerUtil } from '../src/utils/ConnectorControllerUtil.js'
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js'
import type {
  NamespaceTypeMap,
  UseAppKitAccountReturn,
  UseAppKitNetworkReturn,
  WcWallet
} from '../src/utils/TypeUtil.js'
import { AssetUtil, StorageUtil } from './utils.js'

// -- Types ------------------------------------------------------------
export type { Connection } from '@reown/appkit-common'

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

  const { connections, recentConnections } =
    ConnectionControllerUtil.getConnectionsData(chainNamespace)

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

  return {
    connection,
    isPending: isSwitchingConnection,
    switchConnection,
    deleteConnection
  }
}

export interface UseAppKitWalletsReturn {
  /**
   * List of wallets for the initial connect view including WalletConnect wallet and injected wallets together. If user doesn't have any injected wallets, it'll fill the list with most ranked WalletConnect wallets.
   */
  wallets: WalletItem[]

  /**
   * List of WalletConnect wallets from Wallet Guide API. Useful to display all available WalletConnect wallets in a separate Search Wallets view.
   * @see https://walletguide.walletconnect.network/.
   */
  wcWallets: WalletItem[]

  /**
   * Boolean that indicates if WalletConnect wallets are being fetched.
   */
  isFetchingWallets: boolean

  /**
   * Boolean that indicates if a WalletConnect URI is being fetched.
   */
  isFetchingWcUri: boolean

  /**
   * Boolean that indicates if the AppKit is initialized. It's useful to render a fallback UI when the AppKit initializes and detects all injected wallets.
   */
  isInitialized: boolean

  /**
   * The current WalletConnect URI for QR code display. This is set when connecting to a WalletConnect wallet. Reset with resetWcUri().
   */
  wcUri?: string

  /**
   * The wallet currently being connected to. This is set when a connection is initiated and cleared when it completes or fails. For WalletConnect wallets, resetWcUri() should be called to clear the state.
   */
  connectingWallet?: WalletItem

  /**
   * The current page number of WalletConnect wallets.
   */
  page: number

  /**
   * The total number of available WalletConnect wallets based on the AppKit configurations and given parameters.
   */
  count: number

  /**
   * Function to fetch WalletConnect wallets from the explorer API. Allows to list, search and paginate through the wallets.
   * @param options - Options for fetching wallets
   * @param options.page - Page number to fetch (default: 1)
   * @param options.query - Search query to filter wallets (default: '')
   */
  fetchWallets: (options?: { page?: number; query?: string }) => Promise<void>

  /**
   * Function to connect to a wallet.
   * - For WalletConnect wallets: initiates WC connection and returns the URI with the `wcUri` state.
   * - For injected connectors: triggers the extension/wallet directly.
   *
   * @param wallet - The wallet item to connect to
   * @param callbacks - Success and error callbacks
   * @returns Promise that resolves when connection completes or rejects on error
   */
  connect: (wallet: WalletItem, namespace?: ChainNamespace) => Promise<void>

  /**
   * Function to reset the WC URI. Useful to keep `connectingWallet` state sync with the WC URI. Can be called when the QR code is closed.
   */
  resetWcUri: () => void
}

/**
 * Headless hook for wallet connection.
 * Provides all the data and functions needed to build a custom connect UI.
 */
export function useAppKitWallets(): UseAppKitWalletsReturn {
  const { features, remoteFeatures } = useSnapshot(OptionsController.state)
  const isHeadlessEnabled = Boolean(features?.headless && remoteFeatures?.headless)

  const [isFetchingWallets, setIsFetchingWallets] = useState(false)
  const { wcUri, wcFetchingUri } = useSnapshot(ConnectionController.state)
  const {
    wallets: wcAllWallets,
    search: wcSearchWallets,
    page,
    count
  } = useSnapshot(ApiController.state)
  const { initialized, connectingWallet } = useSnapshot(PublicStateController.state)

  async function fetchWallets(fetchOptions?: { page?: number; query?: string }) {
    setIsFetchingWallets(true)
    try {
      if (fetchOptions?.query) {
        await ApiController.searchWallet({ search: fetchOptions?.query })
      } else {
        ApiController.state.search = []
        await ApiController.fetchWalletsByPage({
          page: fetchOptions?.page ?? 1
        })
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch WalletConnect wallets:', error)
    } finally {
      setIsFetchingWallets(false)
    }
  }

  async function connect(_wallet: WalletItem, namespace?: ChainNamespace) {
    PublicStateController.set({ connectingWallet: _wallet })

    try {
      const walletConnector = _wallet?.connectors.find(c => c.chain === namespace)

      const connector =
        walletConnector && namespace
          ? ConnectorController.getConnector({ id: walletConnector?.id, namespace })
          : undefined

      if (_wallet?.isInjected && connector) {
        await ConnectorControllerUtil.connectExternal(connector)
      } else {
        await ConnectionController.connectWalletConnect({ cache: 'never' })
      }
    } catch (error) {
      PublicStateController.set({ connectingWallet: undefined })
      throw error
    }
  }

  function resetWcUri() {
    ConnectionController.resetUri()
  }

  const lastHandledUriRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    lastHandledUriRef.current = undefined
  }, [connectingWallet?.id])

  useEffect(() => {
    const unsubscribe = ConnectionController.subscribeKey('wcUri', wcUri => {
      if (!wcUri) {
        lastHandledUriRef.current = undefined

        return
      }

      if (wcUri === lastHandledUriRef.current || ConnectionController.state.wcLinking) {
        return
      }

      const isMobile = CoreHelperUtil.isMobile()
      const wcWallet = ApiControllerUtil.getWalletById(
        PublicStateController.state.connectingWallet?.id
      )

      if (isMobile && wcWallet?.mobile_link) {
        lastHandledUriRef.current = wcUri
        ConnectionControllerUtil.onConnectMobile(wcWallet)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (
      initialized &&
      remoteFeatures?.headless !== undefined &&
      (!isHeadlessEnabled || !remoteFeatures?.headless)
    ) {
      AlertController.open(
        ConstantsUtil.REMOTE_FEATURES_ALERTS.HEADLESS_NOT_ENABLED.DEFAULT,
        'info'
      )
    }
  }, [initialized, isHeadlessEnabled, remoteFeatures?.headless])

  if (!isHeadlessEnabled || !remoteFeatures?.headless) {
    return {
      wallets: [],
      wcWallets: [],
      isFetchingWallets: false,
      isFetchingWcUri: false,
      isInitialized: false,
      wcUri: undefined,
      connectingWallet: undefined,
      page: 0,
      count: 0,
      connect: () => Promise.resolve(),
      fetchWallets: () => Promise.resolve(),
      resetWcUri
    }
  }

  return {
    wallets: ConnectUtil.getInitialWallets(),
    wcWallets: ConnectUtil.getWalletConnectWallets(
      wcAllWallets as WcWallet[],
      wcSearchWallets as WcWallet[]
    ),
    isFetchingWallets,
    isFetchingWcUri: wcFetchingUri,
    isInitialized: initialized,
    wcUri,
    connectingWallet: connectingWallet as WalletItem | undefined,
    page,
    count,
    connect,
    fetchWallets,
    resetWcUri
  }
}
