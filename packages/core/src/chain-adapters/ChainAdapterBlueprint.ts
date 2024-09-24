import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import type { Connector } from '../utils/TypeUtil.js'
import type { ChainAdapterProvider } from './ChainAdapterProvider.js'
import type { NamespaceConfig } from '@walletconnect/universal-provider'

export abstract class AdapterBlueprint<
  Provider extends ChainAdapterProvider = ChainAdapterProvider
> {
  public readonly namespace: ChainNamespace

  protected availableProviders: Provider[] = []
  protected provider?: Provider

  constructor(params: AdapterBlueprint.Params) {
    this.namespace = params.namespace
  }

  public get connectors(): Connector[] {
    return this.availableProviders
  }

  public get chains(): CaipNetwork[] {
    return this.provider?.chains || []
  }

  public async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const provider = this.availableProviders.find(
      availableProvider => availableProvider.id === params.id
    )

    if (!provider) {
      throw new Error('Provider not found')
    }

    const address = await provider.connect(params)
    this.provider = provider

    return {
      address
    }
  }

  public abstract getWalletConnectNamespaceConfig(): NamespaceConfig

  public abstract getBalance(address: string): Promise<string>

  protected addProvider(...providers: Provider[]) {
    for (const provider of providers) {
      this.availableProviders = this.availableProviders.filter(p => p.name !== provider.name)
    }
  }
}

export namespace AdapterBlueprint {
  export type Params = {
    namespace: ChainNamespace
  }

  export type ConnectParams = { id: Connector['id'] } & (
    | {
        type: 'WALLET_CONNECT'
        onUri: (uri: string) => void
      }
    | {
        type: Omit<Connector['type'], 'WALLET_CONNECT'>
        provider?: Connector['provider']
        info?: Connector['info']
        onUri?: never
      }
  )

  export type ConnectResult = {
    address: string
  }
}
