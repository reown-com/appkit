import type { ProposalTypes, SessionTypes } from '@walletconnect/types'
import {
  type ConnectParams,
  type RequestArguments,
  UniversalProvider
} from '@walletconnect/universal-provider'

import type { CreateAppKit } from '@reown/appkit'
import type { CaipNetwork, CustomCaipNetwork } from '@reown/appkit-common'
import { AppKit, type Metadata, createAppKit } from '@reown/appkit/core'

type ExtendedNamespaces = Omit<SessionTypes.Namespace, 'chains' | 'accounts'> & {
  chains: CustomCaipNetwork[]
  namespace: string
}

export type Config = {
  projectId: string
  metadata: Metadata
  networks: ExtendedNamespaces[]
}

export class UniversalConnector {
  private appKit: AppKit
  private config: Config
  public provider: Awaited<ReturnType<typeof UniversalProvider.init>>
  public session?: SessionTypes.Struct

  constructor({
    appKit,
    provider,
    config
  }: {
    appKit: AppKit
    provider: Awaited<ReturnType<typeof UniversalProvider.init>>
    config: Config
  }) {
    this.appKit = appKit
    this.provider = provider
    this.config = config
    this.session = provider.session
    provider.on('disconnect', this.disconnect.bind(this))
  }

  public static async init(config: Config) {
    const provider = await UniversalProvider.init({
      projectId: config.projectId,
      metadata: config.metadata
    })

    const appKitConfig: CreateAppKit = {
      networks: Object.values(config.networks).flatMap(network => network.chains) as [
        CaipNetwork,
        ...CaipNetwork[]
      ],
      projectId: config.projectId,
      metadata: config.metadata,
      universalProvider: provider,
      manualWCControl: true
    }
    const appKit = createAppKit(appKitConfig)

    return new UniversalConnector({ appKit, provider, config })
  }

  async connect(): Promise<{
    session: SessionTypes.Struct
  }> {
    const namespaces: ProposalTypes.OptionalNamespaces =
      this.config?.networks.reduce<ProposalTypes.OptionalNamespaces>((acc, namespace) => {
        acc[namespace.namespace] = {
          ...namespace,
          methods: namespace.methods || [],
          events: namespace.events || [],
          chains: namespace.chains.map((chain: CustomCaipNetwork) => chain.caipNetworkId) || []
        }

        return acc
      }, {})

    this.appKit.open()
    const session = await this.provider.connect({
      optionalNamespaces: namespaces as ConnectParams['optionalNamespaces']
    })

    this.session = session

    await this.appKit.close()

    return { session: session as SessionTypes.Struct }
  }

  async disconnect() {
    try {
      await this.appKit.disconnect()
      await this.provider.disconnect()
    } catch {
      // Pass
    } finally {
      this.session = undefined
    }
  }

  async request(params: RequestArguments, chain: string) {
    return await this.provider.request(params, chain)
  }
}

export default UniversalConnector
