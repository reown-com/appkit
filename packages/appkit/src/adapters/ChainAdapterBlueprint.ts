import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import type { ChainAdapterConnector } from './ChainAdapterConnector.js'
import type { Connector as AppKitConnector } from '@reown/appkit-core'
import type UniversalProvider from '@walletconnect/universal-provider'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import type { AppKitOptions } from '../utils/index.js'
import type { AppKit } from '../client.js'

type EventName = 'disconnect' | 'accountChanged' | 'switchNetwork'
type EventData = {
  disconnect: () => void
  accountChanged: { address: `0x${string}`; chainId: number | string }
  switchNetwork: { address: `0x${string}`; chainId: number | string }
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

  protected avaiableConnectors: Connector[] = []
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
    if (params.namespace) {
      this.namespace = params.namespace
    }
  }

  /**
   * Gets the available connectors.
   * @returns {Connector[]} An array of available connectors
   */
  public get connectors(): Connector[] {
    return this.avaiableConnectors
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
    this.avaiableConnectors = [
      ...this.avaiableConnectors.filter(
        existing => !connectors.some(newConnector => newConnector.id === existing.id)
      ),
      ...connectors
    ]
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
   * Emits an event with the given name and data.
   * @template T
   * @param {T} eventName - The name of the event to emit
   * @param {EventData[T]} data - The data to be passed to the event listeners
   */
  protected emit<T extends EventName>(eventName: T, data: EventData[T]) {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(callback => callback(data))
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
   * Switches the network.
   * @param {AdapterBlueprint.SwitchNetworkParams} params - Network switching parameters
   */
  public abstract switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void>

  /**
   * Disconnects the current wallet.
   */
  public abstract disconnect(): Promise<void>

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
  }

  export type GetBalanceParams = {
    address: string
    chainId: number
  }

  export type GetProfileParams = {
    address: string
    chainId: number
  }

  export type ConnectParams = { id: AppKitConnector['id'] } & (
    | {
        type: 'WALLET_CONNECT'
        onUri: (uri: string) => void
      }
    | {
        id: AppKitConnector['id']
        type: Omit<AppKitConnector['type'], 'WALLET_CONNECT'>
        provider?: AppKitConnector['provider']
        info?: AppKitConnector['info']
        chainId?: number | string
        onUri?: never
      }
  )

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
    chainId: number
    address: string
  }
}
