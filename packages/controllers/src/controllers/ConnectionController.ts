/* eslint-disable no-console */
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  type Connection,
  ParseUtil
} from '@reown/appkit-common'
import type { W3mFrameProvider, W3mFrameTypes } from '@reown/appkit-wallet'

import { AssetUtil } from '../utils/AssetUtil.js'
import { getPreferredAccountType } from '../utils/ChainControllerUtil.js'
import { ConnectionControllerUtil } from '../utils/ConnectionControllerUtil.js'
import { ConnectorControllerUtil } from '../utils/ConnectorControllerUtil.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { SIWXUtil } from '../utils/SIWXUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  ChainAdapter,
  ConnectedWalletInfo,
  Connector,
  EstimateGasTransactionArgs,
  Provider,
  SendTransactionArgs,
  WcWallet,
  WriteContractArgs
} from '../utils/TypeUtil.js'
import { AppKitError, withErrorBoundary } from '../utils/withErrorBoundary.js'
import { AdapterController } from './AdapterController.js'
import { AlertController } from './AlertController.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { ChainController, type ChainControllerState } from './ChainController.js'
import { ConnectorController } from './ConnectorController.js'
import { EnsController } from './EnsController.js'
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
      await ConnectionController.syncWalletConnectAccount()
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
    ConnectionController.syncProvider({ ...res, chainNamespace: namespace })
    ConnectionController.setStatus('connected', namespace)
    ConnectionController.syncConnectedWalletInfo(namespace)
    StorageUtil.removeDisconnectedConnectorId(options.id, namespace)

    const connectResult = { address: res.address, connectedCaipNetwork: caipNetworkToUse }

    await ConnectionController.connectInactiveNamespaces(options)

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
      ConnectionController.syncConnectedWalletInfo(namespace)
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
    const namespace = ChainController.state.activeChain

    if (!namespace) {
      throw new Error('signMessage: namespace not found')
    }

    const adapter = AdapterController.get(namespace)

    if (!namespace) {
      throw new Error('signMessage: namespace not found')
    }

    if (!adapter) {
      throw new Error('signMessage: adapter not found')
    }

    const address = ChainController.getAccountData(namespace)?.address

    if (!address) {
      throw new Error('signMessage: address not found')
    }

    const result = await adapter?.signMessage({
      message,
      address
    })

    return result?.signature || ''
  },

  request<Params extends object | readonly unknown[], Response>(
    method: string,
    params: Params
  ): Promise<Response> {
    const namespace = ChainController.state.activeChain
    if (!namespace) {
      throw new Error('request: namespace not found')
    }
    const provider = ProviderController.getProvider<Provider>(namespace)
    if (!provider) {
      throw new Error('request: adapter not found')
    }

    return provider.request<Response>({ method, params })
  },

  parseUnits(value: string, decimals: number) {
    const namespace = ChainController.state.activeChain

    if (!namespace) {
      throw new Error('parseUnits: namespace not found')
    }

    const adapter = AdapterController.get(namespace)

    if (!adapter) {
      throw new Error('parseUnits: adapter is required but got undefined')
    }

    return adapter?.parseUnits({ value, decimals }) ?? 0n
  },

  formatUnits(value: bigint, decimals: number) {
    const namespace = ChainController.state.activeChain

    if (!namespace) {
      throw new Error('formatUnits: namespace not found')
    }

    const adapter = AdapterController.get(namespace)

    if (!adapter) {
      throw new Error('formatUnits: adapter is required but got undefined')
    }

    return adapter?.formatUnits({ value, decimals }) ?? '0'
  },

  async updateBalance({
    namespace,
    address,
    chainId
  }: {
    namespace: ChainNamespace
    address?: string
    chainId?: string | number
  }) {
    const addressToUse = address || ChainController.getAccountData(namespace)?.address
    const caipNetwork = chainId
      ? ChainController.getCaipNetworkByNamespace(namespace, chainId)
      : ChainController.getCaipNetwork(namespace)
    if (!caipNetwork || !addressToUse) {
      return
    }

    const adapter = AdapterController.get(namespace)

    if (adapter) {
      const balance = await adapter.getBalance({
        address: addressToUse,
        chainId: caipNetwork.id,
        caipNetwork,
        tokens: OptionsController.state.tokens
      })
      ChainController.setAccountProp('balance', balance.balance, namespace)
      ChainController.setAccountProp('balanceSymbol', balance.symbol, namespace)
    }
  },

  async sendTransaction(args: SendTransactionArgs) {
    const namespace = args.chainNamespace

    if (!namespace) {
      throw new Error('sendTransaction: namespace not found')
    }

    if (ConstantsUtil.SEND_SUPPORTED_NAMESPACES.includes(namespace)) {
      const adapter = AdapterController.get(namespace)

      if (!adapter) {
        throw new Error('sendTransaction: adapter not found')
      }

      const result = await adapter?.sendTransaction({
        ...args,
        caipNetwork: ChainController.getCaipNetwork(namespace)
      })

      return result?.hash || ''
    }

    return ''
  },

  async estimateGas(args: EstimateGasTransactionArgs) {
    const namespace = args.chainNamespace

    if (namespace === CommonConstantsUtil.CHAIN.EVM) {
      const adapter = AdapterController.get(namespace)

      if (!adapter) {
        throw new Error('estimateGas: adapter is required but got undefined')
      }

      const provider = ProviderController.getProvider(namespace)
      const caipNetwork = ChainController.getCaipNetwork(namespace)

      if (!caipNetwork) {
        throw new Error('estimateGas: caipNetwork is required but got undefined')
      }

      const result = await adapter?.estimateGas({ ...args, provider, caipNetwork })

      return result?.gas || 0n
    }

    return 0n
  },

  async writeContract(args: WriteContractArgs) {
    const namespace = args.chainNamespace || ChainController.state.activeChain
    if (!namespace) {
      throw new Error('writeContract: namespace is required but got undefined')
    }

    const adapter = AdapterController.get(namespace)
    if (!adapter) {
      throw new Error('writeContract: adapter is required but got undefined')
    }

    const caipNetwork = ChainController.getCaipNetwork(namespace)
    const caipAddress = ChainController.getAccountData(namespace)?.caipAddress
    const provider = ProviderController.getProvider(namespace)

    if (!caipNetwork || !caipAddress) {
      throw new Error('writeContract: caipNetwork or caipAddress is required but got undefined')
    }

    const result = await adapter?.writeContract({ ...args, caipNetwork, provider, caipAddress })

    return result?.hash as `0x${string}` | null
  },

  async getEnsAddress(name: string) {
    const wcNameAddress = await EnsController.resolveName(name)
    const networkNameAddresses = Object.values(wcNameAddress?.addresses) || []

    return networkNameAddresses[0]?.address || false
  },

  async getEnsAvatar(address: string) {
    const namespace = ChainController.state.activeChain

    if (!namespace) {
      throw new Error('getEnsAvatar: namespace is required but got undefined')
    }

    const avatar = await BlockchainApiController.fetchIdentity({
      address
    })

    return avatar.avatar || false
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

    const isAuth = connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH
    const isWalletConnect = connectorId === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
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
            ConnectionController.setStatus('disconnected', ns)
            ConnectionController.setConnectedWalletInfo(null, ns)
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
  },
  async syncAccount(params: {
    chainNamespace: ChainNamespace
    chainId?: string | number
    address: string
  }) {
    const isActiveNamespace = params.chainNamespace === ChainController.state.activeChain
    const networkOfChain = ChainController.getCaipNetworkByNamespace(
      params.chainNamespace,
      params.chainId
    )

    const { address, chainId, chainNamespace } = params

    const { chainId: activeChainId } = StorageUtil.getActiveNetworkProps()
    const chainIdToUse = chainId || activeChainId
    const isUnsupportedNetwork =
      ChainController.state.activeCaipNetwork?.name === CommonConstantsUtil.UNSUPPORTED_NETWORK_NAME
    const shouldSupportAllNetworks = ChainController.getNetworkProp(
      'supportsAllNetworks',
      chainNamespace
    )

    ConnectionController.setStatus('connected', chainNamespace)
    if (isUnsupportedNetwork && !shouldSupportAllNetworks) {
      return
    }
    if (chainIdToUse) {
      const caipNetworks = ChainController.getCaipNetworks()
      let caipNetwork = caipNetworks.find(n => n.id.toString() === chainIdToUse.toString())
      let fallbackCaipNetwork = caipNetworks.find(n => n.chainNamespace === chainNamespace)

      // If doesn't support all networks, we need to use approved networks
      if (!shouldSupportAllNetworks && !caipNetwork && !fallbackCaipNetwork) {
        // Connection can be requested for a chain that is not supported by the wallet so we need to use approved networks here
        const caipNetworkIds = ChainController.getAllApprovedCaipNetworkIds() || []
        const caipNetworkId = caipNetworkIds.find(
          id => ParseUtil.parseCaipNetworkId(id)?.chainId === chainIdToUse.toString()
        )
        const fallBackCaipNetworkId = caipNetworkIds.find(
          id => ParseUtil.parseCaipNetworkId(id)?.chainNamespace === chainNamespace
        )

        caipNetwork = caipNetworks.find(n => n.caipNetworkId === caipNetworkId)
        fallbackCaipNetwork = caipNetworks.find(
          n =>
            n.caipNetworkId === fallBackCaipNetworkId ||
            // This is a workaround used in Solana network to support deprecated caipNetworkId
            ('deprecatedCaipNetworkId' in n && n.deprecatedCaipNetworkId === fallBackCaipNetworkId)
        )
      }

      const network = caipNetwork || (fallbackCaipNetwork as CaipNetwork)

      if (network?.chainNamespace === ChainController.state.activeChain) {
        // If the network is unsupported and the user doesn't allow unsupported chains, we show the unsupported chain UI
        if (
          OptionsController.state.enableNetworkSwitch &&
          !OptionsController.state.allowUnsupportedChain &&
          ChainController.state.activeCaipNetwork?.name ===
            CommonConstantsUtil.UNSUPPORTED_NETWORK_NAME
        ) {
          ChainController.showUnsupportedChainUI()
        } else {
          ChainController.setActiveCaipNetwork(network)
        }
      } else if (!isActiveNamespace) {
        if (networkOfChain) {
          ChainController.setChainNetworkData(chainNamespace, { caipNetwork: networkOfChain })
        }
      }

      ConnectionController.syncConnectedWalletInfo(chainNamespace)

      const currentAddress = ChainController.getAccountData(chainNamespace)?.address
      if (address.toLowerCase() !== currentAddress?.toLowerCase()) {
        const caipAddress = ChainController.getAccountData(chainNamespace)?.caipAddress
        const newChainId = chainId || caipAddress?.split(':')[1]

        if (!newChainId) {
          return
        }

        const newCaipAddress = `${chainNamespace}:${newChainId}:${address}`

        ConnectionController.setCaipAddress(newCaipAddress as CaipAddress, chainNamespace, true)
      }

      if (isActiveNamespace) {
        await ConnectionController.updateBalance({
          address,
          chainId: network?.id,
          namespace: chainNamespace
        })
      } else {
        await ConnectionController.updateBalance({
          address,
          chainId: networkOfChain?.id,
          namespace: chainNamespace
        })
      }

      ConnectionController.syncIdentity({
        address,
        chainId: chainIdToUse,
        chainNamespace
      })
    }
  },
  async syncIdentity(params: {
    address: string
    chainId: string | number
    chainNamespace: ChainNamespace
  }) {
    const { address, chainId, chainNamespace } = params
    const caipNetworkId: CaipNetworkId = `${chainNamespace}:${chainId}`
    const caipNetworks = ChainController.getCaipNetworks()
    const activeCaipNetwork = caipNetworks.find(n => n.caipNetworkId === caipNetworkId)

    if (activeCaipNetwork?.testnet) {
      ChainController.setAccountProp('profileName', null, chainNamespace)
      ChainController.setAccountProp('profileImage', null, chainNamespace)

      return
    }

    const isAuthConnector =
      ConnectorController.getConnectorId(chainNamespace) === CommonConstantsUtil.CONNECTOR_ID.AUTH

    try {
      const { name, avatar } = await BlockchainApiController.fetchIdentity({
        address
      })

      if (!name && isAuthConnector) {
        await EnsController.getNamesForAddress(address)
      } else {
        ChainController.setAccountProp('profileName', name, chainNamespace)
        ChainController.setAccountProp('profileImage', avatar, chainNamespace)
      }
    } catch {
      if (chainId !== 1) {
        ChainController.setAccountProp('profileImage', null, chainNamespace)
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
        ProviderController.setProviderId(chainNamespace, 'WALLET_CONNECT')
        const caipNetworks = ChainController.getCaipNetworks(chainNamespace)
        if (
          caipNetworks &&
          ChainController.state.activeCaipNetwork &&
          adapter.namespace !== CommonConstantsUtil.CHAIN.EVM
        ) {
          const provider = adapter.getWalletConnectProvider({
            caipNetworks,
            activeCaipNetwork: ChainController.state.activeCaipNetwork
          })
          ProviderController.setProvider(chainNamespace, provider)
        } else {
          ProviderController.setProvider(chainNamespace, universalProvider)
        }

        ConnectorController.setConnectorId('walletConnect', chainNamespace)
        StorageUtil.addConnectedNamespace(chainNamespace)

        const { address } = ParseUtil.parseCaipAddress(sessionAddress as CaipAddress)
        await ConnectionController.syncAccount({
          address,
          chainId: activeChainId as string | number,
          chainNamespace
        })
      } else if (sessionNamespaces.includes(chainNamespace)) {
        ConnectionController.setStatus('disconnected', chainNamespace)
      }

      const data = ChainController.getApprovedCaipNetworksData()
      ConnectionController.syncConnectedWalletInfo(chainNamespace)
      ChainController.setApprovedCaipNetworksData(chainNamespace, {
        approvedCaipNetworkIds: data.approvedCaipNetworkIds,
        supportsAllNetworks: data.supportsAllNetworks
      })
    })

    await Promise.all(syncTasks)
  },
  setCaipAddress(caipAddress: CaipAddress | null, chain: ChainNamespace, shouldRefresh = false) {
    ChainController.setAccountProp('caipAddress', caipAddress, chain, shouldRefresh)
    ChainController.setAccountProp(
      'address',
      CoreHelperUtil.getPlainAddress(caipAddress as CaipAddress),
      chain,
      shouldRefresh
    )
  },
  syncConnectedWalletInfo(chainNamespace: ChainNamespace) {
    const connectorId = ConnectorController.getConnectorId(chainNamespace)
    const providerType = ProviderController.getProviderId(chainNamespace)
    if (providerType === 'AUTH') {
      const provider = ProviderController.getProvider<W3mFrameProvider>(chainNamespace)

      if (provider) {
        const social = StorageUtil.getConnectedSocialProvider() ?? 'email'
        const identifier = provider.getEmail() ?? provider.getUsername()

        ConnectionController.setConnectedWalletInfo(
          { name: providerType, identifier, social },
          chainNamespace
        )
      }
    }
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
          ChainController.setAccountProp(
            'connectedWalletInfo',
            { name, icon, ...info },
            chainNamespace
          )
        }
      }
    } else if (providerType === 'WALLET_CONNECT') {
      const provider = ProviderController.getProvider(chainNamespace)

      if (provider?.session) {
        ConnectionController.setConnectedWalletInfo(
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

        ConnectionController.setConnectedWalletInfo(
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
  setConnectedWalletInfo(
    connectedWalletInfo: ConnectedWalletInfo | null,
    chainNamespace: ChainNamespace
  ) {
    const type = ProviderController.getProviderId(chainNamespace)
    const walletInfo = connectedWalletInfo ? { ...connectedWalletInfo, type } : undefined
    ChainController.setAccountProp('connectedWalletInfo', walletInfo, chainNamespace)
  },

  setStatus(status: ConnectionControllerState['status'], namespace: ChainNamespace) {
    state.status = status
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
              ConnectionController.setStatus('connected', ns)
              ConnectionController.syncConnectedWalletInfo(ns)
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
  }
}

// Export the controller wrapped with our error boundary
export const ConnectionController = withErrorBoundary(controller)
