/* eslint-disable no-console */
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type CaipAddress,
  type CaipNetwork,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  type Connection,
  type Hex,
  ParseUtil
} from '@reown/appkit-common'
import type { W3mFrameTypes } from '@reown/appkit-wallet'

import { getPreferredAccountType } from '../utils/ChainControllerUtil.js'
import { ConnectionControllerUtil } from '../utils/ConnectionControllerUtil.js'
import { ConnectorControllerUtil } from '../utils/ConnectorControllerUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  ChainAdapter,
  Connector,
  EstimateGasTransactionArgs,
  SendTransactionArgs,
  WalletGetAssetsParams,
  WalletGetAssetsResponse,
  WcWallet,
  WriteContractArgs
} from '../utils/TypeUtil.js'
import { AppKitError, withErrorBoundary } from '../utils/withErrorBoundary.js'
import { ChainController, type ChainControllerState } from './ChainController.js'
import { ConnectorController } from './ConnectorController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { RouterController } from './RouterController.js'
import { TransactionsController } from './TransactionsController.js'

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

interface ConnectWalletConnectParameters {
  cache?: 'auto' | 'always' | 'never'
}

export interface ConnectionControllerClient {
  connectWalletConnect?: (params?: ConnectWalletConnectParameters) => Promise<void>
  disconnect: (params?: DisconnectParameters) => Promise<void>
  disconnectConnector: (params: DisconnectConnectorParameters) => Promise<void>
  signMessage: (message: string) => Promise<string>
  sendTransaction: (args: SendTransactionArgs) => Promise<string | null>
  estimateGas: (args: EstimateGasTransactionArgs) => Promise<bigint>
  parseUnits: (value: string, decimals: number) => bigint
  formatUnits: (value: bigint, decimals: number) => string
  connectExternal?: (options: ConnectExternalOptions) => Promise<{ address: string } | undefined>
  reconnectExternal?: (options: ConnectExternalOptions) => Promise<void>
  checkInstalled?: (ids?: string[]) => boolean
  writeContract: (args: WriteContractArgs) => Promise<`0x${string}` | null>
  getEnsAddress: (value: string) => Promise<false | string>
  getEnsAvatar: (value: string) => Promise<false | string>
  grantPermissions: (params: readonly unknown[] | object) => Promise<unknown>
  revokePermissions: (params: {
    pci: string
    permissions: unknown[]
    expiry: number
    address: CaipAddress
  }) => Promise<Hex>
  getCapabilities: (params: string) => Promise<unknown>
  walletGetAssets: (params: WalletGetAssetsParams) => Promise<WalletGetAssetsResponse>
  updateBalance: (chainNamespace: ChainNamespace) => void
}

export interface ConnectionControllerState {
  isSwitchingConnection: boolean
  connections: Map<ChainNamespace, Connection[]>
  recentConnections: Map<ChainNamespace, Connection[]>
  _client?: ConnectionControllerClient
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
  connectionControllerClient?: ConnectionControllerClient
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

// eslint-disable-next-line init-declarations
let wcConnectionPromise: Promise<void> | undefined

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

  _getClient() {
    return state._client
  },

  setClient(client: ConnectionControllerClient) {
    state._client = ref(client)
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

  async connectWalletConnect({ cache = 'auto' }: ConnectWalletConnectParameters = {}) {
    const isInTelegramOrSafariIos =
      CoreHelperUtil.isTelegram() || (CoreHelperUtil.isSafari() && CoreHelperUtil.isIos())

    if (cache === 'always' || (cache === 'auto' && isInTelegramOrSafariIos)) {
      if (wcConnectionPromise) {
        await wcConnectionPromise
        wcConnectionPromise = undefined

        return
      }

      if (!CoreHelperUtil.isPairingExpired(state?.wcPairingExpiry)) {
        const link = state.wcUri
        state.wcUri = link

        return
      }
      wcConnectionPromise = ConnectionController._getClient()
        ?.connectWalletConnect?.()
        .catch(() => undefined)
      ConnectionController.state.status = 'connecting'
      await wcConnectionPromise
      wcConnectionPromise = undefined
      state.wcPairingExpiry = undefined
      ConnectionController.state.status = 'connected'
    } else {
      await ConnectionController._getClient()?.connectWalletConnect?.()
    }
  },

  async connectExternal(
    options: ConnectExternalOptions,
    chain: ChainControllerState['activeChain'],
    setChain = true
  ) {
    const connectData = await ConnectionController._getClient()?.connectExternal?.(options)

    if (setChain) {
      ChainController.setActiveNamespace(chain)
    }

    return connectData
  },

  async reconnectExternal(options: ConnectExternalOptions) {
    await ConnectionController._getClient()?.reconnectExternal?.(options)
    const namespace = options.chain || ChainController.state.activeChain
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
    return ConnectionController._getClient()?.checkInstalled?.(ids) || false
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
    wcConnectionPromise = undefined
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

  async disconnect({ id, namespace, initialDisconnect }: DisconnectParams = {}) {
    try {
      await ConnectionController._getClient()?.disconnect({
        id,
        chainNamespace: namespace,
        initialDisconnect
      })
    } catch (error) {
      throw new AppKitError('Failed to disconnect', 'INTERNAL_SDK_ERROR', error)
    }
  },

  async disconnectConnector({ id, namespace }: DisconnectConnectorParameters) {
    try {
      await ConnectionController._getClient()?.disconnectConnector({ id, namespace })
    } catch (error) {
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

// Export the controller wrapped with our error boundary
export const ConnectionController = withErrorBoundary(controller)
