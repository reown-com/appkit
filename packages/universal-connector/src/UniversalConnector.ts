import type { SessionTypes } from '@walletconnect/types'
import {
  type NamespaceConfig,
  type RequestArguments,
  UniversalProvider
} from '@walletconnect/universal-provider'

import type { AppKitOptions, CreateAppKit } from '@reown/appkit'
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
  modalConfig?: Omit<
    AppKitOptions,
    'networks' | 'adapters' | 'manualWCControl' | 'projectId' | 'metadata' | 'universalProvider'
  >
}

export class UniversalConnector {
  private appKit: AppKit
  private config: Config
  public connecting = false
  private abortConnection: ((reason?: string) => void) | null = null
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
    this.appKit.subscribeState(state => {
      if (!state.open && this.connecting) {
        this.provider.abortPairingAttempt()
        this.abortConnection?.()
      }
    })
  }

  public static async init(config: Config) {
    const provider = await UniversalProvider.init({
      projectId: config.projectId,
      metadata: config.metadata
    })

    const appKitConfig: CreateAppKit = {
      ...config.modalConfig,
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
      this.connecting = true
      await this.appKit.open()

      const session = await Promise.race([
        this.provider.connect({
          optionalNamespaces: namespaces
        }),
        new Promise<SessionTypes.Struct>((_, reject) => {
          this.abortConnection = () => reject(new Error('Connection aborted by user'))
        })
      ])

      if (!session) {
        throw new Error('Error connecting to wallet: No session found')
      }

      return { session }
    } catch (error) {
      throw new Error(
        `Error connecting to wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      this.connecting = false
      this.abortConnection = null
      await this.appKit.close()
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
