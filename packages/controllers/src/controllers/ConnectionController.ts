/* eslint-disable no-console */
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type CaipAddress,
  type CaipNetwork,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  type Connection,
  ConstantsUtil,
  ParseUtil
} from '@reown/appkit-common'
import type { W3mFrameTypes } from '@reown/appkit-wallet'

import { AssetUtil } from '../utils/AssetUtil.js'
import { getPreferredAccountType } from '../utils/ChainControllerUtil.js'
import { ConnectionControllerUtil } from '../utils/ConnectionControllerUtil.js'
import { ConnectorControllerUtil } from '../utils/ConnectorControllerUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { SIWXUtil } from '../utils/SIWXUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  ChainAdapter,
  ConnectedWalletInfo,
  Connector,
  EstimateGasTransactionArgs,
  SendTransactionArgs,
  WalletGetAssetsParams,
  WalletGetAssetsResponse,
  WcWallet,
  WriteContractArgs
} from '../utils/TypeUtil.js'
import { AppKitError, withErrorBoundary } from '../utils/withErrorBoundary.js'
import { AdapterController } from './AdapterController.js'
import { AlertController } from './AlertController.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { ChainController, type ChainControllerState } from './ChainController.js'
import { ConnectorController } from './ConnectorController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { OptionsController } from './OptionsController.js'
import { ProviderController } from './ProviderController.js'
import { RouterController } from './RouterController.js'
import { SendController } from './SendController.js'
import { TransactionsController } from './TransactionsController.js'

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// -- Types --------------------------------------------- //
interface SwitchConnectionParams {
  connection: Connection
  address?: string
  namespace: ChainNamespace
  closeModalOnConnect?: boolean
  onChange?: (params: {
    address: string
    namespace: ChainNamespace
    hasSwitchedAccount: boolean
    hasSwitchedWallet: boolean
  }) => void
}

interface HandleDisconnectedConnectionParams {
  connection: Connection
  namespace: ChainNamespace
  address?: string
  closeModalOnConnect?: boolean
}

interface HandleActiveConnectionParams {
  connection: Connection
  namespace: ChainNamespace
  address?: string
}

interface DisconnectParams {
  id?: string
  namespace?: ChainNamespace
  initialDisconnect?: boolean
}

export interface ConnectExternalOptions {
  id: Connector['id']
  type: Connector['type']
  provider?: Connector['provider']
  address?: string
  info?: Connector['info']
  chain?: ChainNamespace
  chainId?: number | string
  caipNetwork?: CaipNetwork
  socialUri?: string
  preferredAccountType?: 'eoa' | 'smartAccount'
}

interface HandleAuthAccountSwitchParams {
  address: string
  namespace: ChainNamespace
}

export interface DisconnectParameters {
  id?: string
  chainNamespace?: ChainNamespace
  initialDisconnect?: boolean
}

interface DisconnectConnectorParameters {
  id: string
  namespace: ChainNamespace
}

export interface ConnectionControllerState {
  isSwitchingConnection: boolean
  connections: Map<ChainNamespace, Connection[]>
  recentConnections: Map<ChainNamespace, Connection[]>
  wcUri?: string
  wcPairingExpiry?: number
  wcLinking?: {
    href: string
    name: string
  }
  wcBasic?: boolean
  wcError?: boolean
  recentWallet?: WcWallet
  buffering: boolean
  status?: 'connecting' | 'connected' | 'disconnected'
}

type StateKey = keyof ConnectionControllerState

// -- State --------------------------------------------- //
const state = proxy<ConnectionControllerState>({
  connections: new Map(),
  recentConnections: new Map(),
  isSwitchingConnection: false,
  wcError: false,
  buffering: false,
  status: 'disconnected'
})

// -- Controller ---------------------------------------- //
const controller = {
  state,

  subscribe(callback: (newState: ConnectionControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: ConnectionControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  initialize(adapters: ChainAdapter[]) {
    const namespaces = adapters
      .filter((a): a is ChainAdapter & { namespace: ChainNamespace } => Boolean(a.namespace))
      .map(a => a.namespace)

    ConnectionController.syncStorageConnections(namespaces)
  },

  syncStorageConnections(namespaces?: ChainNamespace[]) {
    const storageConnections = StorageUtil.getConnections()

    const namespacesToSync = namespaces ?? Array.from(ChainController.state.chains.keys())

    for (const namespace of namespacesToSync) {
      const storageConnectionsByNamespace = storageConnections[namespace] ?? []

      const recentConnectionsMap = new Map(state.recentConnections)
      recentConnectionsMap.set(namespace, storageConnectionsByNamespace)
      state.recentConnections = recentConnectionsMap
    }
  },

  getConnections(namespace?: ChainNamespace) {
    return namespace ? (state.connections.get(namespace) ?? []) : []
  },

  hasAnyConnection(connectorId: string) {
    const connections = ConnectionController.state.connections

    return Array.from(connections.values())
      .flatMap(_connections => _connections)
      .some(({ connectorId: _connectorId }) => _connectorId === connectorId)
  },

  async connectWalletConnect() {
    if (!CoreHelperUtil.isPairingExpired(state?.wcPairingExpiry)) {
      const link = state.wcUri
      state.wcUri = link

      return
    }
    try {
      ConnectionController.state.status = 'connecting'
      const activeChain = ChainController.state.activeChain
      if (!activeChain) {
        throw new Error('activeChain not found')
      }

      const adapter = AdapterController.get(activeChain)
      const chainId = ChainController.getCaipNetwork(activeChain)?.id

      if (!adapter) {
        throw new Error('Adapter not found')
      }

      const result = await adapter.connectWalletConnect(chainId)

      BlockchainApiController.setClientId(result?.clientId || null)
      StorageUtil.setConnectedNamespaces([...ChainController.state.chains.keys()])
      await tempUtils.syncWalletConnectAccount()
      await SIWXUtil.initializeIfEnabled()
    } catch {
      return
    }
    state.wcPairingExpiry = undefined
    ConnectionController.state.status = 'connected'
  },

  async connectExternal(
    options: ConnectExternalOptions,
    chain: ChainControllerState['activeChain'],
    setChain = true
  ) {
    const activeChain = ChainController.state.activeChain
    const namespace = options.chain || activeChain

    if (!namespace) {
      throw new Error('connectExternal: namespace not found')
    }

    const adapter = AdapterController.get(namespace)

    if (!adapter) {
      throw new Error('connectExternal: adapter not found')
    }

    let shouldUpdateNetwork = true

    if (options.type === 'AUTH') {
      const authNamespaces = CommonConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS
      const hasConnectedAuthNamespace = authNamespaces.some(
        ns => ConnectorController.getConnectorId(ns) === options.type
      )

      if (hasConnectedAuthNamespace && options.chain !== activeChain) {
        shouldUpdateNetwork = false
      }
    }

    if (options.chain && options.chain !== activeChain && !options.caipNetwork) {
      const toConnectNetwork = ChainController.getCaipNetworks().find(
        network => network.chainNamespace === options.chain
      )
      if (toConnectNetwork && shouldUpdateNetwork) {
        ChainController.setActiveCaipNetwork(toConnectNetwork)
      }
    }

    const fallbackCaipNetwork = ChainController.getCaipNetwork(namespace)
    const caipNetworkToUse = options.caipNetwork || fallbackCaipNetwork

    const res = await adapter.connect({
      id: options.id,
      address: options.address,
      info: options.info,
      type: options.type,
      provider: options.provider,
      socialUri: options.socialUri,
      chainId: options.caipNetwork?.id || fallbackCaipNetwork?.id,
      rpcUrl:
        options.caipNetwork?.rpcUrls?.default?.http?.[0] ||
        fallbackCaipNetwork?.rpcUrls?.default?.http?.[0]
    })

    if (!res) {
      return undefined
    }

    StorageUtil.addConnectedNamespace(namespace)
    tempUtils.syncProvider({ ...res, chainNamespace: namespace })
    tempUtils.setStatus('connected', namespace)
    tempUtils.syncConnectedWalletInfo(namespace)
    StorageUtil.removeDisconnectedConnectorId(options.id, namespace)

    const connectResult = { address: res.address, connectedCaipNetwork: caipNetworkToUse }

    await tempUtils.connectInactiveNamespaces(options)

    const connectData = connectResult ? { address: connectResult.address } : undefined

    if (setChain) {
      ChainController.setActiveNamespace(chain)
    }

    return connectData
  },

  async reconnectExternal(options: ConnectExternalOptions) {
    const namespace = options.chain || ChainController.state.activeChain

    if (!namespace) {
      throw new Error('reconnectExternal: namespace not found')
    }

    const adapter = AdapterController.get(namespace)

    if (!adapter) {
      throw new Error('reconnectExternal: adapter not found')
    }

    if (adapter?.reconnect) {
      await adapter?.reconnect(options)
      StorageUtil.addConnectedNamespace(namespace)
      tempUtils.syncConnectedWalletInfo(namespace)
    }

    if (namespace) {
      ConnectorController.setConnectorId(options.id, namespace)
    }
  },

  async setPreferredAccountType(
    accountType: W3mFrameTypes.AccountType,
    namespace: ChainControllerState['activeChain']
  ) {
    if (!namespace) {
      return
    }

    ModalController.setLoading(true, ChainController.state.activeChain)
    const authConnector = ConnectorController.getAuthConnector()
    if (!authConnector) {
      return
    }
    ChainController.setAccountProp('preferredAccountType', accountType, namespace)
    await authConnector.provider.setPreferredAccount(accountType)
    StorageUtil.setPreferredAccountTypes(
      Object.entries(ChainController.state.chains).reduce((acc, [key, _]) => {
        const namespace = key as ChainNamespace
        const accountType = getPreferredAccountType(namespace)
        if (accountType !== undefined) {
          ;(acc as Record<ChainNamespace, string>)[namespace] = accountType
        }

        return acc
      }, {})
    )
    await ConnectionController.reconnectExternal(authConnector)
    ModalController.setLoading(false, ChainController.state.activeChain)
    EventsController.sendEvent({
      type: 'track',
      event: 'SET_PREFERRED_ACCOUNT_TYPE',
      properties: {
        accountType,
        network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
      }
    })
  },

  async signMessage(message: string) {
    return ConnectionController._getClient()?.signMessage(message)
  },

  parseUnits(value: string, decimals: number) {
    return ConnectionController._getClient()?.parseUnits(value, decimals)
  },

  formatUnits(value: bigint, decimals: number) {
    return ConnectionController._getClient()?.formatUnits(value, decimals)
  },

  updateBalance(namespace: ChainNamespace) {
    return ConnectionController._getClient()?.updateBalance(namespace)
  },

  async sendTransaction(args: SendTransactionArgs) {
    return ConnectionController._getClient()?.sendTransaction(args)
  },

  async getCapabilities(params: string) {
    return ConnectionController._getClient()?.getCapabilities(params)
  },

  async grantPermissions(params: object | readonly unknown[]) {
    return ConnectionController._getClient()?.grantPermissions(params)
  },

  async walletGetAssets(params: WalletGetAssetsParams): Promise<WalletGetAssetsResponse> {
    return ConnectionController._getClient()?.walletGetAssets(params) ?? {}
  },

  async estimateGas(args: EstimateGasTransactionArgs) {
    return ConnectionController._getClient()?.estimateGas(args)
  },

  async writeContract(args: WriteContractArgs) {
    return ConnectionController._getClient()?.writeContract(args)
  },

  async getEnsAddress(value: string) {
    return ConnectionController._getClient()?.getEnsAddress(value)
  },

  async getEnsAvatar(value: string) {
    return ConnectionController._getClient()?.getEnsAvatar(value)
  },

  checkInstalled(ids?: string[]) {
    if (!ids) {
      return Boolean(window.ethereum)
    }

    return ids.some(id => Boolean(window.ethereum?.[String(id)]))
  },

  resetWcConnection() {
    state.wcUri = undefined
    state.wcPairingExpiry = undefined
    state.wcLinking = undefined
    state.recentWallet = undefined
    state.status = 'disconnected'
    TransactionsController.resetTransactions()
    StorageUtil.deleteWalletConnectDeepLink()
    StorageUtil.deleteRecentWallet()
  },

  resetUri() {
    state.wcUri = undefined
    state.wcPairingExpiry = undefined
  },

  finalizeWcConnection(address?: string) {
    const { wcLinking, recentWallet } = ConnectionController.state

    if (wcLinking) {
      StorageUtil.setWalletConnectDeepLink(wcLinking)
    }

    if (recentWallet) {
      StorageUtil.setAppKitRecent(recentWallet)
    }

    if (address) {
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_SUCCESS',
        address,
        properties: {
          method: wcLinking ? 'mobile' : 'qrcode',
          name: RouterController.state.data?.wallet?.name || 'Unknown',
          view: RouterController.state.view,
          walletRank: recentWallet?.order
        }
      })
    }
  },

  setWcBasic(wcBasic: ConnectionControllerState['wcBasic']) {
    state.wcBasic = wcBasic
  },

  setUri(uri: string) {
    state.wcUri = uri
    state.wcPairingExpiry = CoreHelperUtil.getPairingExpiry()
  },

  setWcLinking(wcLinking: ConnectionControllerState['wcLinking']) {
    state.wcLinking = wcLinking
  },

  setWcError(wcError: ConnectionControllerState['wcError']) {
    state.wcError = wcError
    state.buffering = false
  },

  setRecentWallet(wallet: ConnectionControllerState['recentWallet']) {
    state.recentWallet = wallet
  },

  setBuffering(buffering: ConnectionControllerState['buffering']) {
    state.buffering = buffering
  },

  setStatus(status: ConnectionControllerState['status']) {
    state.status = status
  },

  setIsSwitchingConnection(
    isSwitchingConnection: ConnectionControllerState['isSwitchingConnection']
  ) {
    state.isSwitchingConnection = isSwitchingConnection
  },

  async disconnect(params: DisconnectParams = {}) {
    const { id: connectorIdParam, namespace: chainNamespace, initialDisconnect } = params || {}

    const namespace = chainNamespace || ChainController.state.activeChain
    const namespaceConnectorId = ConnectorController.getConnectorId(namespace)
    const connectorId = connectorIdParam || namespaceConnectorId

    const isAuth = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH
    const isWalletConnect = connectorId === ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    const shouldDisconnectAll = isAuth || isWalletConnect || !chainNamespace

    try {
      const namespaces = Array.from(ChainController.state.chains.keys())
      /*
       * If the connector is WalletConnect or Auth, disconnect all namespaces
       * since they share a single connector instance across all adapters
       */
      const namespacesToDisconnect = shouldDisconnectAll ? namespaces : [chainNamespace]

      const disconnectPromises = namespacesToDisconnect.map(async ns => {
        const currentConnectorId = ConnectorController.getConnectorId(ns)
        const connectorIdToDisconnect = connectorIdParam || currentConnectorId
        if (connectorIdToDisconnect) {
          const disconnectData = await ConnectionController.disconnectConnector({
            id: connectorIdToDisconnect,
            namespace: ns
          })
          if (disconnectData) {
            if (isAuth) {
              StorageUtil.deleteConnectedSocialProvider()
            }

            disconnectData.connections.forEach(connection => {
              StorageUtil.addDisconnectedConnectorId(connection.connectorId, ns)
            })
          }

          if (initialDisconnect) {
            ChainController.resetAccount(ns)
            ChainController.resetNetwork(ns)
            StorageUtil.removeConnectedNamespace(ns)
            StorageUtil.addDisconnectedConnectorId(ConnectorController.getConnectorId(ns) || '', ns)
            ConnectorController.removeConnectorId(ns)
            ProviderController.resetChain(ns)

            ChainController.setAccountProp('user', null, ns)
            tempUtils.setStatus('disconnected', ns)
            tempUtils.setConnectedWalletInfo(null, ns)
          }
        }
      })

      const disconnectResults = await Promise.allSettled(disconnectPromises)

      SendController.resetSend()
      ConnectionController.resetWcConnection()

      if (SIWXUtil.getSIWX()?.signOutOnDisconnect) {
        await SIWXUtil.clearSessions()
      }

      ConnectorController.setFilterByNamespace(undefined)
      ConnectionController.syncStorageConnections()

      const failures = disconnectResults.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected'
      )

      if (failures.length > 0) {
        throw new Error(failures.map(f => f.reason.message).join(', '))
      }

      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_SUCCESS',
        properties: {
          namespace: chainNamespace || 'all'
        }
      })
    } catch (error) {
      throw new AppKitError('Failed to disconnect', 'INTERNAL_SDK_ERROR', error)
    }
  },

  async disconnectConnector({
    id,
    namespace
  }: DisconnectConnectorParameters): Promise<{ connections: Connection[] }> {
    try {
      ModalController.setLoading(true, namespace)

      let disconnectResult = {
        connections: []
      }

      const adapter = AdapterController.get(namespace)
      const caipAddress = ChainController.state.chains.get(namespace)?.accountState?.caipAddress

      /**
       * When the page loaded, the controller doesn't have address yet.
       * To disconnect, we are checking enableReconnect flag to disconnect the namespace.
       */
      if (caipAddress || !OptionsController.state.enableReconnect) {
        disconnectResult = await adapter?.disconnect({ id })
      }

      ModalController.setLoading(false, namespace)

      return disconnectResult
    } catch (error) {
      ModalController.setLoading(false, namespace)
      throw new AppKitError('Failed to disconnect connector', 'INTERNAL_SDK_ERROR', error)
    }
  },

  setConnections(connections: Connection[], chainNamespace: ChainNamespace) {
    const connectionsMap = new Map(state.connections)
    connectionsMap.set(chainNamespace, connections)
    state.connections = connectionsMap
  },

  async handleAuthAccountSwitch({ address, namespace }: HandleAuthAccountSwitchParams) {
    const accountData = ChainController.getAccountData(namespace)
    const smartAccount = accountData?.user?.accounts?.find(c => c.type === 'smartAccount')

    const accountType =
      smartAccount &&
      smartAccount.address.toLowerCase() === address.toLowerCase() &&
      ConnectorControllerUtil.canSwitchToSmartAccount(namespace)
        ? 'smartAccount'
        : 'eoa'

    await ConnectionController.setPreferredAccountType(accountType, namespace)
  },

  async handleActiveConnection({ connection, namespace, address }: HandleActiveConnectionParams) {
    const connector = ConnectorController.getConnectorById(connection.connectorId)
    const isAuthConnector = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH

    if (!connector) {
      throw new Error(`No connector found for connection: ${connection.connectorId}`)
    }

    if (!isAuthConnector) {
      const connectData = await ConnectionController.connectExternal(
        {
          id: connector.id,
          type: connector.type,
          provider: connector.provider,
          address,
          chain: namespace
        },
        namespace
      )

      return connectData?.address
    } else if (isAuthConnector && address) {
      await ConnectionController.handleAuthAccountSwitch({ address, namespace })
    }

    return address
  },

  async handleDisconnectedConnection({
    connection,
    namespace,
    address,
    closeModalOnConnect
  }: HandleDisconnectedConnectionParams) {
    const connector = ConnectorController.getConnectorById(connection.connectorId)
    const authName = connection.auth?.name?.toLowerCase()

    const isAuthConnector = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH
    const isWCConnector = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

    if (!connector) {
      throw new Error(`No connector found for connection: ${connection.connectorId}`)
    }

    let newAddress: string | undefined = undefined

    if (isAuthConnector) {
      if (authName && ConnectorControllerUtil.isSocialProvider(authName)) {
        const { address: socialAddress } = await ConnectorControllerUtil.connectSocial({
          social: authName,
          closeModalOnConnect,
          onOpenFarcaster() {
            ModalController.open({ view: 'ConnectingFarcaster' })
          },
          onConnect() {
            RouterController.replace('ProfileWallets')
          }
        })

        newAddress = socialAddress
      } else {
        const { address: emailAddress } = await ConnectorControllerUtil.connectEmail({
          closeModalOnConnect,
          onOpen() {
            ModalController.open({ view: 'EmailLogin' })
          },
          onConnect() {
            RouterController.replace('ProfileWallets')
          }
        })

        newAddress = emailAddress
      }
    } else if (isWCConnector) {
      const { address: wcAddress } = await ConnectorControllerUtil.connectWalletConnect({
        walletConnect: true,
        connector,
        closeModalOnConnect,
        onOpen(isMobile) {
          const view = isMobile ? 'AllWallets' : 'ConnectingWalletConnect'
          if (ModalController.state.open) {
            RouterController.push(view)
          } else {
            ModalController.open({ view })
          }
        },
        onConnect() {
          RouterController.replace('ProfileWallets')
        }
      })

      newAddress = wcAddress
    } else {
      const connectData = await ConnectionController.connectExternal(
        {
          id: connector.id,
          type: connector.type,
          provider: connector.provider,
          chain: namespace
        },
        namespace
      )

      if (connectData) {
        newAddress = connectData.address
      }
    }

    if (isAuthConnector && address) {
      await ConnectionController.handleAuthAccountSwitch({ address, namespace })
    }

    return newAddress
  },

  async switchConnection({
    connection,
    address,
    namespace,
    closeModalOnConnect,
    onChange
  }: SwitchConnectionParams) {
    let currentAddress: string | undefined = undefined

    const caipAddress = ChainController.getAccountData(namespace)?.caipAddress

    if (caipAddress) {
      const { address: currentAddressParsed } = ParseUtil.parseCaipAddress(caipAddress)

      currentAddress = currentAddressParsed
    }

    const status = ConnectionControllerUtil.getConnectionStatus(connection, namespace)

    switch (status) {
      case 'connected':
      case 'active': {
        const newAddress = await ConnectionController.handleActiveConnection({
          connection,
          namespace,
          address
        })

        if (currentAddress && newAddress) {
          const hasSwitchedAccount = newAddress.toLowerCase() !== currentAddress.toLowerCase()

          onChange?.({
            address: newAddress,
            namespace,
            hasSwitchedAccount,
            hasSwitchedWallet: status === 'active'
          })
        }
        break
      }

      case 'disconnected': {
        const newAddress = await ConnectionController.handleDisconnectedConnection({
          connection,
          namespace,
          address,
          closeModalOnConnect
        })

        if (newAddress) {
          onChange?.({
            address: newAddress,
            namespace,
            hasSwitchedAccount: true,
            hasSwitchedWallet: true
          })
        }
        break
      }
      default:
        throw new Error(`Invalid connection status: ${status}`)
    }
  }
}

const tempUtils = {
  setConnectedWalletInfo(
    connectedWalletInfo: ConnectedWalletInfo | null,
    chainNamespace: ChainNamespace
  ) {
    const type = ProviderController.getProviderId(chainNamespace)
    const walletInfo = connectedWalletInfo ? { ...connectedWalletInfo, type } : undefined
    ChainController.setAccountProp('connectedWalletInfo', walletInfo, chainNamespace)
  },
  syncConnectedWalletInfo(chainNamespace: ChainNamespace) {
    const connectorId = ConnectorController.getConnectorId(chainNamespace)
    const providerType = ProviderController.getProviderId(chainNamespace)

    if (providerType === 'ANNOUNCED' || providerType === 'INJECTED') {
      if (connectorId) {
        const connectors = ConnectorController.getConnectors()
        const connector = connectors.find(c => {
          const isConnectorId = c.id === connectorId
          const isRdns = c.info?.rdns === connectorId

          const hasMultiChainConnector = c.connectors?.some(
            _c => _c.id === connectorId || _c.info?.rdns === connectorId
          )

          return isConnectorId || isRdns || Boolean(hasMultiChainConnector)
        })
        if (connector) {
          const { info, name, imageUrl } = connector
          const icon = imageUrl || AssetUtil.getConnectorImage(connector)
          tempUtils.setConnectedWalletInfo({ name, icon, ...info }, chainNamespace)
        }
      }
    } else if (providerType === 'WALLET_CONNECT') {
      const provider = ProviderController.getProvider(chainNamespace)

      if (provider?.session) {
        tempUtils.setConnectedWalletInfo(
          {
            ...provider.session.peer.metadata,
            name: provider.session.peer.metadata.name,
            icon: provider.session.peer.metadata.icons?.[0]
          },
          chainNamespace
        )
      }
    } else if (connectorId) {
      if (
        connectorId === CommonConstantsUtil.CONNECTOR_ID.COINBASE_SDK ||
        connectorId === CommonConstantsUtil.CONNECTOR_ID.COINBASE
      ) {
        const connector = ConnectorController.getConnectors().find(c => c.id === connectorId)
        const name = connector?.name || 'Coinbase Wallet'
        const icon = connector?.imageUrl || AssetUtil.getConnectorImage(connector)
        const info = connector?.info

        tempUtils.setConnectedWalletInfo(
          {
            ...info,
            name,
            icon
          },
          chainNamespace
        )
      }
    }
  },
  setStatus(status: ConnectionControllerState['status'], namespace: ChainNamespace) {
    ChainController.setAccountProp('status', status, namespace)

    // If at least one namespace is connected, set the connection status
    if (ConnectorController.isConnected()) {
      StorageUtil.setConnectionStatus('connected')
    } else {
      StorageUtil.setConnectionStatus('disconnected')
    }
  },
  syncProvider({
    type,
    provider,
    id,
    chainNamespace
  }: {
    type: Connector['type']
    provider: Connector['provider']
    id: Connector['id']
    chainNamespace: ChainNamespace
  }) {
    ProviderController.setProviderId(chainNamespace, type)
    ProviderController.setProvider(chainNamespace, provider)
    ConnectorController.setConnectorId(id, chainNamespace)
  },
  async connectInactiveNamespaces(params: ConnectExternalOptions) {
    const isConnectingToAuth = params.type === 'AUTH'

    const authNamespaces = CommonConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS
    const otherAuthNamespaces = authNamespaces.filter(ns => ns !== params.chain)

    const activeCaipNetwork = ChainController.state.activeCaipNetwork
    const activeNamespace = activeCaipNetwork?.chainNamespace
    if (!activeNamespace) {
      throw new Error('connectInactiveNamespaces: active namespace not found')
    }

    const activeAdapter = AdapterController.get(activeCaipNetwork?.chainNamespace)
    const activeProvider = ProviderController.getProvider(activeCaipNetwork?.chainNamespace)

    if (isConnectingToAuth) {
      await Promise.all(
        otherAuthNamespaces.map(async ns => {
          try {
            const provider = ProviderController.getProvider(ns)
            const caipNetworkToUse = ChainController.getCaipNetwork(ns)

            const adapter = AdapterController.get(ns)
            const res = await adapter?.connect({
              ...params,
              provider,
              socialUri: undefined,
              chainId: caipNetworkToUse?.id,
              rpcUrl: caipNetworkToUse?.rpcUrls?.default?.http?.[0]
            })

            if (res) {
              StorageUtil.addConnectedNamespace(ns)
              StorageUtil.removeDisconnectedConnectorId(params.id, ns)
              this.setStatus('connected', ns)
              this.syncConnectedWalletInfo(ns)
            }
          } catch (error) {
            // Check this later, need to move the errors
            AlertController.warn(
              'ErrorUtil.ALERT_WARNINGS.INACTIVE_NAMESPACE_NOT_CONNECTED.displayMessage',
              `ErrorUtil.ALERT_WARNINGS.INACTIVE_NAMESPACE_NOT_CONNECTED.debugMessage(
                ns,
                error instanceof Error ? error.message : undefined
              )`,
              'ErrorUtil.ALERT_WARNINGS.INACTIVE_NAMESPACE_NOT_CONNECTED.code'
            )
          }
        })
      )

      // Make the secure site back to current network after reconnecting the other namespaces
      if (activeCaipNetwork) {
        await activeAdapter?.switchNetwork({
          caipNetwork: activeCaipNetwork,
          provider: activeProvider,
          providerType: params.type
        })
      }
    }
  },
  async syncWalletConnectAccount() {
    const universalProvider = ProviderController.getProvider(ChainController.state.activeChain)
    if (!universalProvider?.session) {
      return
    }

    const sessionNamespaces = Object.keys(universalProvider.session?.namespaces || {})
    const syncTasks = ChainController.state.chains.keys().map(async chainNamespace => {
      const adapter = AdapterController.get(chainNamespace)

      if (!adapter) {
        return
      }

      const namespaceAccounts =
        universalProvider.session?.namespaces?.[chainNamespace]?.accounts || []

      // We try and find the address for this network in the session object.
      const activeChainId = ChainController.state.activeCaipNetwork?.id

      const sessionAddress =
        namespaceAccounts.find(account => {
          const { chainId } = ParseUtil.parseCaipAddress(account as CaipAddress)

          return chainId === activeChainId?.toString()
        }) || namespaceAccounts[0]

      if (sessionAddress) {
        /*
         * Const caipAddress = ParseUtil.validateCaipAddress(sessionAddress)
         * const { chainId, address } = ParseUtil.parseCaipAddress(caipAddress)
         */
        ProviderController.setProviderId(chainNamespace, 'WALLET_CONNECT')
        const caipNetworks = ChainController.getCaipNetworks(chainNamespace)
        if (
          caipNetworks &&
          ChainController.state.activeCaipNetwork &&
          adapter.namespace !== CommonConstantsUtil.CHAIN.EVM
        ) {
          const provider = adapter.getWalletConnectProvider({
            caipNetworks,
            provider: universalProvider,
            activeCaipNetwork: ChainController.state.activeCaipNetwork
          })
          ProviderController.setProvider(chainNamespace, provider)
        } else {
          ProviderController.setProvider(chainNamespace, universalProvider)
        }

        ConnectorController.setConnectorId('WALLET_CONNECT', chainNamespace)
        StorageUtil.addConnectedNamespace(chainNamespace)

        /*
         * CHECK THIS
         * await this.syncAccount({
         *   address,
         *   chainId,
         *   chainNamespace
         * })
         */
      } else if (sessionNamespaces.includes(chainNamespace)) {
        tempUtils.setStatus('disconnected', chainNamespace)
      }

      const data = ChainController.getApprovedCaipNetworksData()
      tempUtils.syncConnectedWalletInfo(chainNamespace)
      ChainController.setApprovedCaipNetworksData(chainNamespace, {
        approvedCaipNetworkIds: data.approvedCaipNetworkIds,
        supportsAllNetworks: data.supportsAllNetworks
      })
    })

    await Promise.all(syncTasks)
  }
}

// Export the controller wrapped with our error boundary
export const ConnectionController = withErrorBoundary(controller)
