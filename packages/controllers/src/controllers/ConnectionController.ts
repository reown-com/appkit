/* eslint-disable no-console */
import { proxy, ref } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { type CaipAddress, type CaipNetwork, type ChainNamespace } from '@reown/appkit-common'
import type { W3mFrameTypes } from '@reown/appkit-wallet'

import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
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
import { AppKitError, withErrorBoundary } from '../utils/withErrorBoundary.js'
import { AccountController } from './AccountController.js'
import { ChainController } from './ChainController.js'
import { ConnectorController } from './ConnectorController.js'
import { EventsController } from './EventsController.js'
import { ModalController } from './ModalController.js'
import { RouterController } from './RouterController.js'
import { TransactionsController } from './TransactionsController.js'

// -- Types --------------------------------------------- //
export type Connection = {
  accounts: { address: string }[]
  connectorId: string
}

interface SwitchAccountParams {
  connection: Connection
  address: string
  namespace: ChainNamespace
}

export interface ConnectExternalOptions {
  id: Connector['id']
  type: Connector['type']
  provider?: Connector['provider']
  info?: Connector['info']
  chain?: ChainNamespace
  chainId?: number | string
  caipNetwork?: CaipNetwork
  socialUri?: string
}

export interface ConnectionControllerClient {
  connectWalletConnect?: () => Promise<void>
  disconnect: (chainNamespace?: ChainNamespace) => Promise<void>
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
const controller = {
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

  async connectExternal(options: ConnectExternalOptions, chain: ChainNamespace, setChain = true) {
    await ConnectionController._getClient()?.connectExternal?.(options)

    if (setChain) {
      ChainController.setActiveNamespace(chain)
    }
  },

  async reconnectExternal(options: ConnectExternalOptions) {
    await ConnectionController._getClient()?.reconnectExternal?.(options)
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

  async disconnect(namespace?: ChainNamespace) {
    try {
      await ConnectionController._getClient()?.disconnect(namespace)
    } catch (error) {
      throw new AppKitError('Failed to disconnect', 'INTERNAL_SDK_ERROR', error)
    }
  },

  setConnections(connections: Connection[], chainNamespace: ChainNamespace) {
    state.connections.set(chainNamespace, connections)
  },

  switchAccount({ connection, address, namespace }: SwitchAccountParams) {
    const connectedConnectorId = ConnectorController.state.activeConnectorIds[namespace]
    const isConnectorConnected = connectedConnectorId === connection.connectorId

    if (isConnectorConnected) {
      const currentNetwork = ChainController.state.activeCaipNetwork

      if (currentNetwork) {
        const caipAddress = `${namespace}:${currentNetwork.id}:${address}`
        AccountController.setCaipAddress(caipAddress as CaipAddress, namespace)
      } else {
        console.warn(`No current network found for namespace "${namespace}"`)
      }
    } else {
      const connector = ConnectorController.getConnector(connection.connectorId)

      if (connector) {
        ConnectionController.connectExternal(connector, namespace)
      } else {
        console.warn(`No connector found for namespace "${namespace}"`)
      }
    }
  }
}

// Export the controller wrapped with our error boundary
export const ConnectionController = withErrorBoundary(controller)
