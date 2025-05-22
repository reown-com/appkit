import { proxy, ref } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type CaipAddress,
  type CaipNetwork,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  ParseUtil,
  type ParsedCaipAddress
} from '@reown/appkit-common'
import type { W3mFrameTypes } from '@reown/appkit-wallet'

import { ConnectionControllerUtil } from '../utils/ConnectionControllerUtil.js'
import { ConnectorControllerUtil } from '../utils/ConnectorControllerUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { SIWXUtil } from '../utils/SIWXUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  Connector,
  EstimateGasTransactionArgs,
  SendTransactionArgs,
  WalletGetAssetsParams,
  WalletGetAssetsResponse,
  WcWallet,
  WriteContractArgs
} from '../utils/TypeUtil.js'
import { AccountController } from './AccountController.js'
import { ChainController } from './ChainController.js'
import { ConnectorController } from './ConnectorController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { RouterController } from './RouterController.js'
import { TransactionsController } from './TransactionsController.js'

// -- Types --------------------------------------------- //
export type Connection = {
  accounts: { type?: string; address: string }[]
  caipNetwork?: CaipNetwork
  connectorId: string
  auth?: {
    name: string | undefined
    username: string | undefined
  }
}

interface ConnectParams {
  connection: Connection
  address: string
  namespace: ChainNamespace
  onConnectorChange?: (connector: Connector) => void
  onAddressChange?: (parsedCaipAddress: ParsedCaipAddress) => void
}

interface HandleConnectParams {
  connection: Connection
  namespace: ChainNamespace
  address: string
}

interface HandleActiveConnectionParams {
  connection: Connection
  namespace: ChainNamespace
  address: string
}

interface DisconnectParams {
  id?: string
  namespace?: ChainNamespace
  disconnectAll?: boolean
}

export interface ConnectExternalOptions {
  id: Connector['id']
  type: Connector['type']
  provider?: Connector['provider']
  info?: Connector['info']
  chain?: ChainNamespace
  chainId?: number | string
  caipNetwork?: CaipNetwork
}

export interface ConnectionControllerClient {
  connectWalletConnect?: () => Promise<void>
  disconnect: (id?: string, chainNamespace?: ChainNamespace) => Promise<void>
  disconnectAll: (chainNamespace?: ChainNamespace) => Promise<void>
  signMessage: (message: string) => Promise<string>
  sendTransaction: (args: SendTransactionArgs) => Promise<string | null>
  estimateGas: (args: EstimateGasTransactionArgs) => Promise<bigint>
  parseUnits: (value: string, decimals: number) => bigint
  formatUnits: (value: bigint, decimals: number) => string
  connectExternal?: (options: ConnectExternalOptions) => Promise<void>
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
    address: `0x${string}`
  }) => Promise<`0x${string}`>
  getCapabilities: (params: string) => Promise<unknown>
  walletGetAssets: (params: WalletGetAssetsParams) => Promise<WalletGetAssetsResponse>
  updateBalance: (chainNamespace: ChainNamespace) => void
}

export interface ConnectionControllerState {
  connections: Map<ChainNamespace, Connection[]>
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
  wcError: false,
  buffering: false,
  status: 'disconnected'
})

// eslint-disable-next-line init-declarations
let wcConnectionPromise: Promise<void> | undefined

// -- Controller ---------------------------------------- //
export const ConnectionController = {
  state,

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

  async connectWalletConnect() {
    if (CoreHelperUtil.isTelegram() || (CoreHelperUtil.isSafari() && CoreHelperUtil.isIos())) {
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
      wcConnectionPromise = this._getClient()
        ?.connectWalletConnect?.()
        .catch(() => undefined)
      this.state.status = 'connecting'
      await wcConnectionPromise
      wcConnectionPromise = undefined
      state.wcPairingExpiry = undefined
      this.state.status = 'connected'
    } else {
      await this._getClient()?.connectWalletConnect?.()
    }
  },

  async connectExternal(options: ConnectExternalOptions, chain: ChainNamespace, setChain = true) {
    await this._getClient()?.connectExternal?.(options)

    if (setChain) {
      ChainController.setActiveNamespace(chain)
    }
  },

  async reconnectExternal(options: ConnectExternalOptions) {
    await this._getClient()?.reconnectExternal?.(options)
    const namespace = options.chain || ChainController.state.activeChain
    if (namespace) {
      ConnectorController.setConnectorId(options.id, namespace)
    }
  },

  async setPreferredAccountType(accountType: W3mFrameTypes.AccountType, namespace: ChainNamespace) {
    ModalController.setLoading(true, ChainController.state.activeChain)
    const authConnector = ConnectorController.getAuthConnector()
    if (!authConnector) {
      return
    }
    AccountController.setPreferredAccountType(accountType, namespace)
    await authConnector.provider.setPreferredAccount(accountType)
    StorageUtil.setPreferredAccountTypes(
      AccountController.state.preferredAccountTypes ?? { [namespace]: accountType }
    )
    await this.reconnectExternal(authConnector)
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
    return this._getClient()?.signMessage(message)
  },

  parseUnits(value: string, decimals: number) {
    return this._getClient()?.parseUnits(value, decimals)
  },

  formatUnits(value: bigint, decimals: number) {
    return this._getClient()?.formatUnits(value, decimals)
  },

  async sendTransaction(args: SendTransactionArgs) {
    return this._getClient()?.sendTransaction(args)
  },

  async getCapabilities(params: string) {
    return this._getClient()?.getCapabilities(params)
  },

  async grantPermissions(params: object | readonly unknown[]) {
    return this._getClient()?.grantPermissions(params)
  },

  async walletGetAssets(params: WalletGetAssetsParams): Promise<WalletGetAssetsResponse> {
    return this._getClient()?.walletGetAssets(params) ?? {}
  },

  async estimateGas(args: EstimateGasTransactionArgs) {
    return this._getClient()?.estimateGas(args)
  },

  async writeContract(args: WriteContractArgs) {
    return this._getClient()?.writeContract(args)
  },

  async getEnsAddress(value: string) {
    return this._getClient()?.getEnsAddress(value)
  },

  async getEnsAvatar(value: string) {
    return this._getClient()?.getEnsAvatar(value)
  },

  checkInstalled(ids?: string[]) {
    return this._getClient()?.checkInstalled?.(ids) || false
  },

  resetWcConnection() {
    state.wcUri = undefined
    state.wcPairingExpiry = undefined
    state.wcLinking = undefined
    state.recentWallet = undefined
    state.status = 'disconnected'
    TransactionsController.resetTransactions()
    StorageUtil.deleteWalletConnectDeepLink()
  },

  resetUri() {
    state.wcUri = undefined
    state.wcPairingExpiry = undefined
    wcConnectionPromise = undefined
  },

  finalizeWcConnection() {
    const { wcLinking, recentWallet } = ConnectionController.state

    if (wcLinking) {
      StorageUtil.setWalletConnectDeepLink(wcLinking)
    }

    if (recentWallet) {
      StorageUtil.setAppKitRecent(recentWallet)
    }

    EventsController.sendEvent({
      type: 'track',
      event: 'CONNECT_SUCCESS',
      properties: {
        method: wcLinking ? 'mobile' : 'qrcode',
        name: RouterController.state.data?.wallet?.name || 'Unknown'
      }
    })
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

  async disconnect({ id, namespace, disconnectAll }: DisconnectParams = {}) {
    try {
      ModalController.setLoading(true, namespace)
      await SIWXUtil.clearSessions()
      await ChainController.disconnect({ id, chainNamespace: namespace, disconnectAll })
      ModalController.setLoading(false, namespace)
      ConnectorController.setFilterByNamespace(undefined)
    } catch (error) {
      throw new Error('Failed to disconnect')
    }
  },

  setConnections(connections: Connection[], chainNamespace: ChainNamespace) {
    // Doing state.connections.set won't work because valtio doesn't react to proxy state changes
    state.connections = new Map(state.connections.set(chainNamespace, connections))
  },

  async handleAuthAccountSwitch(address: string, namespace: ChainNamespace) {
    const smartAccountAddress = AccountController.getSmartAccountAddress(namespace)
    const isAddressSmartAccount = smartAccountAddress?.toLowerCase() === address.toLowerCase()
    const accountType =
      isAddressSmartAccount && ConnectorController.canSwitchToSmartAccount(namespace)
        ? 'smartAccount'
        : 'eoa'

    await ConnectionController.setPreferredAccountType(accountType, namespace)
  },

  async handleAlreadyConnectedConnection({ connection, namespace, address }: HandleConnectParams) {
    if (!connection.caipNetwork) {
      throw new Error(`No CAIP network found for connection: ${connection.connectorId}`)
    }

    const isAuthConnector = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH

    const newCaipAddress: CaipAddress = `${namespace}:${connection.caipNetwork?.id}:${address}`
    const parsedCaipAddress = ParseUtil.parseCaipAddress(newCaipAddress)

    if (isAuthConnector) {
      await ConnectionController.handleAuthAccountSwitch(address, namespace)

      return parsedCaipAddress
    }

    AccountController.setCaipAddress(newCaipAddress, namespace)

    return parsedCaipAddress
  },

  async handleActiveConnection({ connection, namespace, address }: HandleActiveConnectionParams) {
    const connector = ConnectorController.getConnectorById(connection.connectorId)
    const isAuthConnector = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH

    if (!connector) {
      throw new Error(`No connector found for connection: ${connection.connectorId}`)
    }

    await ConnectionController.connectExternal(connector, namespace)

    if (isAuthConnector) {
      await ConnectionController.handleAuthAccountSwitch(address, namespace)
    }

    return connector
  },

  async handleDisconnectedConnection({ connection, namespace, address }: HandleConnectParams) {
    const connector = ConnectorController.getConnectorById(connection.connectorId)
    const authName = connection.auth?.name?.toLowerCase()

    const isAuthConnector = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH
    const isWCConnector = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

    if (!connector) {
      throw new Error(`No connector found for connection: ${connection.connectorId}`)
    }

    if (isAuthConnector) {
      if (authName && ConnectorControllerUtil.isSocialProvider(authName)) {
        await ConnectorControllerUtil.connectSocial(authName)
      } else {
        await ConnectorControllerUtil.connectEmail()
      }
    } else if (isWCConnector) {
      await ConnectorControllerUtil.connectWalletConnect({
        walletConnect: true,
        connector,
        wallet: undefined
      })
    } else {
      await this.connectExternal(connector, namespace)
    }

    if (isAuthConnector) {
      await ConnectionController.handleAuthAccountSwitch(address, namespace)
    }

    return connector
  },

  async connect({
    connection,
    address,
    namespace,
    onConnectorChange,
    onAddressChange
  }: ConnectParams) {
    const status = ConnectionControllerUtil.getConnectionStatus(connection, namespace)

    // Validate the account switch
    ConnectionControllerUtil.validateAccountSwitch({ namespace, connection, address })

    switch (status) {
      case 'connected': {
        const parsedCaipAddress = await ConnectionController.handleAlreadyConnectedConnection({
          connection,
          namespace,
          address
        })

        onAddressChange?.(parsedCaipAddress)
        break
      }
      case 'active': {
        const connector = await ConnectionController.handleActiveConnection({
          connection,
          namespace,
          address
        })

        onConnectorChange?.(connector)
        break
      }
      case 'disconnected': {
        const connector = await ConnectionController.handleDisconnectedConnection({
          connection,
          namespace,
          address
        })

        onConnectorChange?.(connector)
        break
      }
      default:
        throw new Error(`Invalid connection status: ${status}`)
    }
  }
}
