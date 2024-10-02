import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import type { ChainAdapterConnector } from './ChainAdapterConnector.js'
import type { NamespaceConfig } from '@walletconnect/universal-provider'
import type { Connector as AppKitConnector } from '@reown/appkit-core'
import type UniversalProvider from '@walletconnect/universal-provider'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'

export abstract class AdapterBlueprint<
  Connector extends ChainAdapterConnector = ChainAdapterConnector
> {
  public readonly namespace: ChainNamespace
  public readonly caipNetworks?: CaipNetwork[]

  protected avaiableConnectors: Connector[] = []
  protected connector?: Connector
  protected provider?: Connector['provider']

  constructor(params: AdapterBlueprint.Params) {
    this.namespace = params.namespace
    this.caipNetworks = params.caipNetworks
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

  public abstract connectWalletConnect(onUri: (uri: string) => void): Promise<void>

  public abstract connect(id: Connector['id']): Promise<string>

  public abstract switchNetwork(
    caipNetwork: CaipNetwork,
    provider?: Connector['provider']
  ): Promise<void>

  public abstract disconnect(): Promise<void>

  public abstract getWalletConnectNamespaceConfig(): NamespaceConfig

  public abstract getBalance(address: string): Promise<string>

  protected addConnector(...connectors: Connector[]) {
    // Filter out duplicates and add new connectors
    this.avaiableConnectors = [
      ...this.avaiableConnectors.filter(
        existing => !connectors.some(newConnector => newConnector.id === existing.id)
      ),
      ...connectors
    ]
  }
}

export namespace AdapterBlueprint {
  export type Params = {
    namespace: ChainNamespace
    caipNetworks?: CaipNetwork[]
  }

  export type ConnectParams = { id: AppKitConnector['id'] } & (
    | {
        type: 'WALLET_CONNECT'
        onUri: (uri: string) => void
      }
    | {
        type: Omit<AppKitConnector['type'], 'WALLET_CONNECT'>
        provider?: AppKitConnector['provider']
        info?: AppKitConnector['info']
        onUri?: never
      }
  )

  export type ConnectResult = {
    address: string
  }
}
