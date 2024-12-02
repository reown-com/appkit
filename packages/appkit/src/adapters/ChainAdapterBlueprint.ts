import {
  getW3mThemeVariables,
  type CaipAddress,
  type CaipNetwork,
  type ChainNamespace
} from '@reown/appkit-common'
import type { ChainAdapterConnector } from './ChainAdapterConnector.js'
import {
  AccountController,
  OptionsController,
  ThemeController,
  type AccountType,
  type AccountControllerState,
  type Connector as AppKitConnector,
  type AuthConnector,
  type Metadata,
  type Tokens
} from '@reown/appkit-core'
import type UniversalProvider from '@walletconnect/universal-provider'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import type { AppKitOptions } from '../utils/index.js'
import type { AppKit } from '../client.js'
import { snapshot } from 'valtio/vanilla'

type EventName = 'disconnect' | 'accountChanged' | 'switchNetwork'
type EventData = {
  disconnect: () => void
  accountChanged: { address: string; chainId?: number | string }
  switchNetwork: { address?: string; chainId: number | string }
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
  public caipNetworks?: CaipNetwork[]
  public projectId?: string

  protected availableConnectors: Connector[] = []
  protected connector?: Connector
  protected provider?: Connector['provider']

  private eventListeners = new Map<EventName, Set<EventCallback<EventName>>>()

  /**
   * Creates an instance of AdapterBlueprint.
   * @param {AdapterBlueprint.Params} params - The parameters for initializing the adapter
   */
  constructor(params?: AdapterBlueprint.Params) {
    if (params) {
      this.construct(params)
    }
  }

  /**
   * Initializes the adapter with the given parameters.
   * @param {AdapterBlueprint.Params} params - The parameters for initializing the adapter
   */
  construct(params: AdapterBlueprint.Params) {
    this.caipNetworks = params.networks
    this.projectId = params.projectId
    this.namespace = params.namespace
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
    return this.caipNetworks || []
  }

  /**
   * Sets the universal provider for WalletConnect.
   * @param {UniversalProvider} universalProvider - The universal provider instance
   */
  public setUniversalProvider(universalProvider: UniversalProvider) {
    this.addConnector({
      id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
      type: 'WALLET_CONNECT',
      name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      provider: universalProvider,
      imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      chain: this.namespace,
      chains: []
    } as unknown as Connector)
  }

  /**
   * Sets the auth provider.
   * @param {W3mFrameProvider} authProvider - The auth provider instance
   */
  public setAuthProvider(authProvider: W3mFrameProvider): void {
    this.addConnector({
      id: ConstantsUtil.AUTH_CONNECTOR_ID,
      type: 'AUTH',
      name: 'Auth',
      provider: authProvider,
      imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.AUTH_CONNECTOR_ID],
      chain: this.namespace,
      chains: []
    } as unknown as Connector)
  }

  /**
   * Adds one or more connectors to the available connectors list.
   * @param {...Connector} connectors - The connectors to add
   */
  protected addConnector(...connectors: Connector[]) {
    if (connectors.some(connector => connector.id === 'ID_AUTH')) {
      const authConnector = connectors.find(
        connector => connector.id === 'ID_AUTH'
      ) as AuthConnector

      const optionsState = snapshot(OptionsController.state)
      const themeMode = ThemeController.getSnapshot().themeMode
      const themeVariables = ThemeController.getSnapshot().themeVariables

      authConnector?.provider?.syncDappData?.({
        metadata: optionsState.metadata as Metadata,
        sdkVersion: optionsState.sdkVersion,
        projectId: optionsState.projectId,
        sdkType: optionsState.sdkType
      })
      authConnector.provider.syncTheme({
        themeMode,
        themeVariables,
        w3mThemeVariables: getW3mThemeVariables(themeVariables, themeMode)
      })
    }

    const connectorsAdded = new Set<string>()
    this.availableConnectors = [...connectors, ...this.availableConnectors].filter(connector => {
      if (connectorsAdded.has(connector.id)) {
        return false
      }

      connectorsAdded.add(connector.id)

      return true
    })
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
   * @param {(uri: string) => void} onUri - Callback function to handle the WalletConnect URI
   * @param {number | string} [chainId] - Optional chain ID to connect to
   */
  public abstract connectWalletConnect(
    onUri: (uri: string) => void,
    chainId?: number | string
  ): Promise<void>

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
  public abstract switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void>

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
   * Gets the profile for a given address and chain ID.
   * @param {AdapterBlueprint.GetProfileParams} params - Profile retrieval parameters
   * @returns {Promise<AdapterBlueprint.GetProfileResult>} Profile result
   */
  public abstract getProfile(
    params: AdapterBlueprint.GetProfileParams
  ): Promise<AdapterBlueprint.GetProfileResult>

  /**
   * Synchronizes the connectors with the given options and AppKit instance.
   * @param {AppKitOptions} [options] - Optional AppKit options
   * @param {AppKit} [appKit] - Optional AppKit instance
   */
  public abstract syncConnectors(options?: AppKitOptions, appKit?: AppKit): void

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
   * Gets the ENS address for a given name.
   * @param {AdapterBlueprint.GetEnsAddressParams} params - Parameters including name
   * @returns {Promise<AdapterBlueprint.GetEnsAddressResult>} Object containing the ENS address
   */
  public abstract getEnsAddress(
    params: AdapterBlueprint.GetEnsAddressParams
  ): Promise<AdapterBlueprint.GetEnsAddressResult>

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
}

export namespace AdapterBlueprint {
  export type Params = {
    namespace?: ChainNamespace
    networks?: CaipNetwork[]
    projectId?: string
  }

  export type SwitchNetworkParams = {
    caipNetwork: CaipNetwork
    provider?: AppKitConnector['provider']
    providerType?: AppKitConnector['type']
  }

  export type GetBalanceParams = {
    address: string
    chainId: number | string
    caipNetwork?: CaipNetwork
    tokens?: Tokens
  }

  export type GetProfileParams = {
    address: string
    chainId: number | string
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
  }

  export type EstimateGasTransactionResult = {
    gas: bigint
  }

  export type WriteContractParams = {
    receiverAddress: string
    tokenAmount: bigint
    tokenAddress: string
    fromAddress: string
    method: 'send' | 'transfer' | 'call'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: any
    caipNetwork: CaipNetwork
    provider?: AppKitConnector['provider']
    caipAddress: CaipAddress
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

  export type SendTransactionParams = {
    address: `0x${string}`
    to: string
    data: string
    value: bigint | number
    gasPrice: bigint | number
    gas?: bigint | number
    caipNetwork?: CaipNetwork
    provider?: AppKitConnector['provider']
  }

  export type SendTransactionResult = {
    hash: string
  }

  export type GetEnsAddressParams = {
    name: string
    caipNetwork: CaipNetwork
  }

  export type GetEnsAddressResult = {
    address: string | false
  }

  export type GetBalanceResult = {
    balance: string
    symbol: string
  }

  export type GetProfileResult = {
    profileImage?: string
    profileName?: string
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
