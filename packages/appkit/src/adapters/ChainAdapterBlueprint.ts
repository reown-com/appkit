import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import type { ChainAdapterConnector } from './ChainAdapterConnector.js'
import type { NamespaceConfig } from '@walletconnect/universal-provider'
import type { Connector as AppKitConnector } from '@reown/appkit-core'
import type UniversalProvider from '@walletconnect/universal-provider'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import type { AppKitOptions } from '../utils/index.js'
import type { AppKit } from '../client.js'

type EventName = 'disconnect' | 'accountChanged' | 'switchNetwork'
type EventData = {
  disconnect: () => void
  accountChanged: string
  switchNetwork: number | string
}
type EventCallback<T extends EventName> = (data: EventData[T]) => void

export abstract class AdapterBlueprint<
  Connector extends ChainAdapterConnector = ChainAdapterConnector
> {
  public namespace: ChainNamespace | undefined
  public readonly caipNetworks?: CaipNetwork[]
  public readonly projectId?: string

  protected avaiableConnectors: Connector[] = []
  protected connector?: Connector
  protected provider?: Connector['provider']

  private eventListeners = new Map<EventName, Set<EventCallback<EventName>>>()

  constructor(params: AdapterBlueprint.Params) {
    this.caipNetworks = params.networks
    this.projectId = params.projectId
    if (params.namespace) {
      this.namespace = params.namespace
    }
  }

  public get connectors(): Connector[] {
    return this.avaiableConnectors
  }

  public get networks(): CaipNetwork[] {
    return this.caipNetworks || []
  }

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

  public abstract connectWalletConnect(
    onUri: (uri: string) => void,
    chainId?: number | string
  ): Promise<void>

  public abstract connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult>

  public abstract switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void>

  public abstract disconnect(): Promise<void>

  public abstract getWalletConnectNamespaceConfig(): NamespaceConfig

  public abstract getBalance(address: string): Promise<string>

  public abstract syncConnectors(options: AppKitOptions, appKit: AppKit): void

  protected addConnector(...connectors: Connector[]) {
    this.avaiableConnectors = [
      ...this.avaiableConnectors.filter(
        existing => !connectors.some(newConnector => newConnector.id === existing.id)
      ),
      ...connectors
    ]
  }

  public on<T extends EventName>(eventName: T, callback: EventCallback<T>) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set())
    }

    this.eventListeners.get(eventName)?.add(callback as EventCallback<EventName>)
  }

  public off<T extends EventName>(eventName: T, callback: EventCallback<T>) {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.delete(callback as EventCallback<EventName>)
    }
  }

  protected emit<T extends EventName>(eventName: T, data: EventData[T]) {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }
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

  export type ConnectResult = {
    address: string
    type: AppKitConnector['type']
    provider: AppKitConnector['provider']
    chainId: number
  }
}
