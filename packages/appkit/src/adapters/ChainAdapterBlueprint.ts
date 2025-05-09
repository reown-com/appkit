import UniversalProvider from '@walletconnect/universal-provider'

import {
  type CaipAddress,
  type CaipNetwork,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil
} from '@reown/appkit-common'
import {
  AccountController,
  type AccountControllerState,
  type AccountType,
  type Connector as AppKitConnector,
  ChainController,
  type Connection,
  type Tokens,
  type WriteContractArgs
} from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'
import type { W3mFrameProvider } from '@reown/appkit-wallet'

import type { AppKitBaseClient } from '../client/appkit-base-client.js'
import { WalletConnectConnector } from '../connectors/WalletConnectConnector.js'
import type { AppKitOptions } from '../utils/index.js'
import type { ChainAdapterConnector } from './ChainAdapterConnector.js'

type EventName =
  | 'disconnect'
  | 'accountChanged'
  | 'connections'
  | 'switchNetwork'
  | 'connectors'
  | 'pendingTransactions'
type EventData = {
  disconnect: () => void
  accountChanged: { address: string; chainId?: number | string }
  switchNetwork: { address?: string; chainId: number | string }
  connections: Connection[]
  connectors: ChainAdapterConnector[]
  pendingTransactions: () => void
}
type EventCallback<T extends EventName> = (data: EventData[T]) => void

/**
 * Abstract class representing a chain adapter blueprint.
 * @template Connector - The type of connector extending ChainAdapterConnector
 */
export abstract class AdapterBlueprint<
  Connector extends ChainAdapterConnector = ChainAdapterConnector
> {
  public namespace: ChainNamespace | undefined
  public projectId?: string
  public adapterType: string | undefined
  public getCaipNetworks: (namespace?: ChainNamespace) => CaipNetwork[]
  protected availableConnectors: Connector[] = []
  protected connector?: Connector
  protected provider?: Connector['provider']

  private eventListeners = new Map<EventName, Set<EventCallback<EventName>>>()

  /**
   * Creates an instance of AdapterBlueprint.
   * @param {AdapterBlueprint.Params} params - The parameters for initializing the adapter
   */
  constructor(params?: AdapterBlueprint.Params) {
    this.getCaipNetworks = (namespace?: ChainNamespace) =>
      ChainController.getCaipNetworks(namespace)

    if (params) {
      this.construct(params)
    }
  }

  /**
   * Initializes the adapter with the given parameters.
   * @param {AdapterBlueprint.Params} params - The parameters for initializing the adapter
   */
  construct(params: AdapterBlueprint.Params) {
    this.projectId = params.projectId
    this.namespace = params.namespace
    this.adapterType = params.adapterType
  }

  /**
   * Gets the available connectors.
   * @returns {Connector[]} An array of available connectors
   */
  public get connectors(): Connector[] {
    return this.availableConnectors
  }

  /**
   * Gets the supported networks.
   * @returns {CaipNetwork[]} An array of supported networks
   */
  public get networks(): CaipNetwork[] {
    return this.getCaipNetworks(this.namespace)
  }

  /**
   * Sets the universal provider for WalletConnect.
   * @param {UniversalProvider} universalProvider - The universal provider instance
   */
  public abstract setUniversalProvider(universalProvider: UniversalProvider): void

  /**
   * Sets the auth provider.
   * @param {W3mFrameProvider} authProvider - The auth provider instance
   */
  public setAuthProvider(authProvider: W3mFrameProvider): void {
    this.addConnector({
      id: CommonConstantsUtil.CONNECTOR_ID.AUTH,
      type: 'AUTH',
      name: CommonConstantsUtil.CONNECTOR_NAMES.AUTH,
      provider: authProvider,
      imageId: PresetsUtil.ConnectorImageIds[CommonConstantsUtil.CONNECTOR_ID.AUTH],
      chain: this.namespace,
      chains: []
    } as unknown as Connector)
  }

  /**
   * Adds one or more connectors to the available connectors list.
   * @param {...Connector} connectors - The connectors to add
   */
  protected addConnector(...connectors: Connector[]) {
    const connectorsAdded = new Set<string>()
    this.availableConnectors = [...connectors, ...this.availableConnectors].filter(connector => {
      if (connectorsAdded.has(connector.id)) {
        return false
      }

      connectorsAdded.add(connector.id)

      return true
    })

    this.emit('connectors', this.availableConnectors)
  }

  protected setStatus(status: AccountControllerState['status'], chainNamespace?: ChainNamespace) {
    AccountController.setStatus(status, chainNamespace)
  }

  /**
   * Adds an event listener for a specific event.
   * @template T
   * @param {T} eventName - The name of the event
   * @param {EventCallback<T>} callback - The callback function to be called when the event is emitted
   */
  public on<T extends EventName>(eventName: T, callback: EventCallback<T>) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set())
    }

    this.eventListeners.get(eventName)?.add(callback as EventCallback<EventName>)
  }

  /**
   * Removes an event listener for a specific event.
   * @template T
   * @param {T} eventName - The name of the event
   * @param {EventCallback<T>} callback - The callback function to be removed
   */
  public off<T extends EventName>(eventName: T, callback: EventCallback<T>) {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.delete(callback as EventCallback<EventName>)
    }
  }

  /**
   * Removes all event listeners.
   */
  public removeAllEventListeners() {
    this.eventListeners.forEach(listeners => {
      listeners.clear()
    })
  }

  /**
   * Emits an event with the given name and optional data.
   * @template T
   * @param {T} eventName - The name of the event to emit
   * @param {EventData[T]} [data] - The optional data to be passed to the event listeners
   */
  protected emit<T extends EventName>(eventName: T, data?: EventData[T]) {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(callback => callback(data as EventData[T]))
    }
  }

  /**
   * Connects to WalletConnect.
   * @param {number | string} [_chainId] - Optional chain ID to connect to
   */
  public async connectWalletConnect(
    _chainId?: number | string
  ): Promise<undefined | { clientId: string }> {
    const connector = this.getWalletConnectConnector()

    const result = await connector.connectWalletConnect()

    return { clientId: result.clientId }
  }

  /**
   * Connects to a wallet.
   * @param {AdapterBlueprint.ConnectParams} params - Connection parameters
   * @returns {Promise<AdapterBlueprint.ConnectResult>} Connection result
   */
  public abstract connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult>

  /**
   * Gets the accounts for the connected wallet.
   * @returns {Promise<AccountType[]>} An array of account objects with their associated type and namespace
   */

  public abstract getAccounts(
    params: AdapterBlueprint.GetAccountsParams
  ): Promise<AdapterBlueprint.GetAccountsResult>

  /**
   * Switches the network.
   * @param {AdapterBlueprint.SwitchNetworkParams} params - Network switching parameters
   */
  public async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    const { caipNetwork, providerType } = params

    if (!params.provider) {
      return
    }

    const provider = 'provider' in params.provider ? params.provider.provider : params.provider

    if (providerType === 'WALLET_CONNECT') {
      ;(provider as UniversalProvider).setDefaultChain(caipNetwork.caipNetworkId)

      return
    }

    if (provider && providerType === 'AUTH') {
      const authProvider = provider as W3mFrameProvider
      const preferredAccountType =
        AccountController.state.preferredAccountTypes?.[caipNetwork.chainNamespace]
      await authProvider.switchNetwork(caipNetwork.caipNetworkId)
      const user = await authProvider.getUser({
        chainId: caipNetwork.caipNetworkId,
        preferredAccountType
      })

      this.emit('switchNetwork', user)
    }
  }

  /**
   * Disconnects the current wallet.
   */
  public abstract disconnect(params?: AdapterBlueprint.DisconnectParams): Promise<void>

  /**
   * Gets the balance for a given address and chain ID.
   * @param {AdapterBlueprint.GetBalanceParams} params - Balance retrieval parameters
   * @returns {Promise<AdapterBlueprint.GetBalanceResult>} Balance result
   */
  public abstract getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult>

  /**
   * Synchronizes the connectors with the given options and AppKit instance.
   * @param {AppKitOptions} [options] - Optional AppKit options
   * @param {AppKit} [appKit] - Optional AppKit instance
   */
  public abstract syncConnectors(
    options?: AppKitOptions,
    appKit?: AppKitBaseClient
  ): void | Promise<void>

  /**
   * Synchronizes the connection with the given parameters.
   * @param {AdapterBlueprint.SyncConnectionParams} params - Synchronization parameters
   * @returns {Promise<AdapterBlueprint.ConnectResult>} Connection result
   */
  public abstract syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult>

  /**
   * Signs a message with the connected wallet.
   * @param {AdapterBlueprint.SignMessageParams} params - Parameters including message to sign, address, and optional provider
   * @returns {Promise<AdapterBlueprint.SignMessageResult>} Object containing the signature
   */
  public abstract signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult>

  /**
   * Estimates gas for a transaction.
   * @param {AdapterBlueprint.EstimateGasTransactionArgs} params - Parameters including address, to, data, and optional provider
   * @returns {Promise<AdapterBlueprint.EstimateGasTransactionResult>} Object containing the gas estimate
   */
  public abstract estimateGas(
    params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult>

  /**
   * Sends a transaction.
   * @param {AdapterBlueprint.SendTransactionParams} params - Parameters including address, to, data, value, gasPrice, gas, and optional provider
   * @returns {Promise<AdapterBlueprint.SendTransactionResult>} Object containing the transaction hash
   */
  public abstract sendTransaction(
    params: AdapterBlueprint.SendTransactionParams
  ): Promise<AdapterBlueprint.SendTransactionResult>

  /**
   * Writes a contract transaction.
   * @param {AdapterBlueprint.WriteContractParams} params - Parameters including receiver address, token amount, token address, from address, method, and ABI
   * @returns {Promise<AdapterBlueprint.WriteContractResult>} Object containing the transaction hash
   */
  public abstract writeContract(
    params: AdapterBlueprint.WriteContractParams
  ): Promise<AdapterBlueprint.WriteContractResult>

  /**
   * Parses a decimal string value into a bigint with the specified number of decimals.
   * @param {AdapterBlueprint.ParseUnitsParams} params - Parameters including value and decimals
   * @returns {AdapterBlueprint.ParseUnitsResult} The parsed bigint value
   */
  public abstract parseUnits(
    params: AdapterBlueprint.ParseUnitsParams
  ): AdapterBlueprint.ParseUnitsResult

  /**
   * Formats a bigint value into a decimal string with the specified number of decimals.
   * @param {AdapterBlueprint.FormatUnitsParams} params - Parameters including value and decimals
   * @returns {AdapterBlueprint.FormatUnitsResult} The formatted decimal string
   */
  public abstract formatUnits(
    params: AdapterBlueprint.FormatUnitsParams
  ): AdapterBlueprint.FormatUnitsResult

  /**
   * Gets the WalletConnect provider.
   * @param {AdapterBlueprint.GetWalletConnectProviderParams} params - Parameters including provider, caip networks, and active caip network
   * @returns {AdapterBlueprint.GetWalletConnectProviderResult} The WalletConnect provider
   */
  public abstract getWalletConnectProvider(
    params: AdapterBlueprint.GetWalletConnectProviderParams
  ): AdapterBlueprint.GetWalletConnectProviderResult

  /**
   * Reconnects to a wallet.
   * @param {AdapterBlueprint.ReconnectParams} params - Reconnection parameters
   */
  public reconnect?(params: AdapterBlueprint.ReconnectParams): Promise<void>

  public abstract getCapabilities(params: AdapterBlueprint.GetCapabilitiesParams): Promise<unknown>

  public abstract grantPermissions(
    params: AdapterBlueprint.GrantPermissionsParams
  ): Promise<unknown>

  public abstract revokePermissions(
    params: AdapterBlueprint.RevokePermissionsParams
  ): Promise<`0x${string}`>

  public abstract walletGetAssets(
    params: AdapterBlueprint.WalletGetAssetsParams
  ): Promise<AdapterBlueprint.WalletGetAssetsResponse>

  protected getWalletConnectConnector(): WalletConnectConnector {
    const connector = this.connectors.find(c => c instanceof WalletConnectConnector) as
      | WalletConnectConnector
      | undefined

    if (!connector) {
      throw new Error('WalletConnectConnector not found')
    }

    return connector
  }
}

export namespace AdapterBlueprint {
  export type Params = {
    namespace?: ChainNamespace
    networks?: CaipNetwork[]
    projectId?: string
    adapterType?: string
  }

  export type SwitchNetworkParams = {
    caipNetwork: CaipNetwork
    provider?: AppKitConnector['provider']
    providerType?: AppKitConnector['type']
  }

  export type GetBalanceParams = {
    address: string | undefined
    chainId: number | string | undefined
    caipNetwork?: CaipNetwork
    tokens?: Tokens
  }

  export type DisconnectParams = {
    provider?: AppKitConnector['provider']
    providerType?: AppKitConnector['type']
  }

  export type ConnectParams = {
    id: string
    provider?: unknown
    info?: unknown
    type: string
    chain?: ChainNamespace
    chainId?: number | string
    rpcUrl?: string
    socialUri?: string
  }

  export type ReconnectParams = ConnectParams

  export type SyncConnectionParams = {
    id: string
    namespace: ChainNamespace
    chainId?: number | string
    rpcUrl: string
  }

  export type SignMessageParams = {
    message: string
    address: string
    provider?: AppKitConnector['provider']
  }

  export type SignMessageResult = {
    signature: string
  }

  export type EstimateGasTransactionArgs = {
    address: string
    to: string
    data: string
    caipNetwork: CaipNetwork
    provider?: AppKitConnector['provider']
    value?: bigint | number
  }

  export type EstimateGasTransactionResult = {
    gas: bigint
  }

  export type WriteContractParams = WriteContractArgs & {
    caipNetwork: CaipNetwork
    provider?: AppKitConnector['provider']
    caipAddress: CaipAddress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  export type WriteContractResult = {
    hash: string
  }

  export type ParseUnitsParams = {
    value: string
    decimals: number
  }

  export type ParseUnitsResult = bigint

  export type FormatUnitsParams = {
    value: bigint
    decimals: number
  }

  export type FormatUnitsResult = string

  export type GetWalletConnectProviderParams = {
    provider: AppKitConnector['provider']
    caipNetworks: CaipNetwork[]
    activeCaipNetwork: CaipNetwork
  }

  export type GetWalletConnectProviderResult = AppKitConnector['provider']

  export type GetCapabilitiesParams = string

  export type GrantPermissionsParams = object | readonly unknown[]

  export type RevokePermissionsParams = {
    pci: string
    permissions: unknown[]
    expiry: number
    address: `0x${string}`
  }

  export type WalletGetAssetsParams = {
    account: `0x${string}`
    assetFilter?: Record<`0x${string}`, (`0x${string}` | 'native')[]>
    assetTypeFilter?: ('NATIVE' | 'ERC20')[]
    chainFilter?: `0x${string}`[]
  }

  export type WalletGetAssetsResponse = Record<
    `0x${string}`,
    {
      address: `0x${string}` | 'native'
      balance: `0x${string}`
      type: 'NATIVE' | 'ERC20'
      metadata: Record<string, unknown>
    }[]
  >

  export type SendTransactionParams = {
    to: string
    value: bigint | number
    data?: string
    gasPrice?: bigint | number
    gas?: bigint | number
    caipNetwork?: CaipNetwork
    provider?: AppKitConnector['provider']
  }

  export type SendTransactionResult = {
    hash: string
  }

  export type GetBalanceResult = {
    balance: string
    symbol: string
  }

  export type ConnectResult = {
    id: AppKitConnector['id']
    type: AppKitConnector['type']
    provider: AppKitConnector['provider']
    chainId: number | string
    address: string
  }

  export type GetAccountsResult = { accounts: AccountType[] }
  export type GetAccountsParams = {
    id: AppKitConnector['id']
    namespace?: ChainNamespace
  }
}
