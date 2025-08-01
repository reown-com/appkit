import type { SessionTypes } from '@walletconnect/types'
import {
  type NamespaceConfig,
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
  }

  public static async init(config: Config) {
    const provider = await UniversalProvider.init({
      projectId: config.projectId,
      metadata: config.metadata
    })

    const appKitConfig: CreateAppKit = {
      networks: config.networks.flatMap(network => network.chains) as [
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
    const namespaces: NamespaceConfig = this.config?.networks.reduce<NamespaceConfig>(
      (acc, namespace) => {
        acc[namespace.namespace] = {
          ...(namespace || {}),
          methods: namespace?.methods || [],
          events: namespace?.events || [],
          chains: namespace?.chains?.map((chain: CustomCaipNetwork) => chain.caipNetworkId) || []
        }

        return acc
      },
      {}
    )

    try {
      await this.appKit.open()
      const session = await this.provider.connect({
        optionalNamespaces: namespaces
      })

      if (!session) {
        throw new Error('Error connecting to wallet: No session found')
      }

      await this.appKit.close()

      return { session }
    } catch (error) {
      await this.appKit.close()
      throw new Error(
        `Error connecting to wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async disconnect() {
    await this.appKit.disconnect()
    await this.provider.disconnect()
  }

  async request(params: RequestArguments, chain: string) {
    return await this.provider.request(params, chain)
  }
}

export default UniversalConnector
