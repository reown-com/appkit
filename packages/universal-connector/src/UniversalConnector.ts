import type { ProposalTypes, SessionTypes } from '@walletconnect/types'
import {
  type ConnectParams,
  type RequestArguments,
  UniversalProvider
} from '@walletconnect/universal-provider'

import type { CreateAppKit } from '@reown/appkit'
import type { CaipNetwork, CustomCaipNetwork } from '@reown/appkit-common'
import { AppKit, type Metadata, createAppKit } from '@reown/appkit/core'

/*
 * Example network config:
 * const suiMainnet = {
 *   id: 784,
 *   chainNamespace: 'sui' as const,
 *   caipNetworkId: 'sui:mainnet',
 *   name: 'Sui',
 *   nativeCurrency: { name: 'SUI', symbol: 'SUI', decimals: 9 },
 *   rpcUrls: { default: { http: ['https://fullnode.mainnet.sui.io:443'] } },
 *   connectParams: {
 *     methods: ['sui_signPersonalMessage'],
 *     chains: ['sui:mainnet'],
 *     events: []
 *   }
 * }
 */

/*
 * Example network config:
 * const suiTestnet = {
 *   id: 784,
 *   chainNamespace: 'sui' as const,
 *   caipNetworkId: 'sui:testnet',
 *   name: 'Sui',
 *   nativeCurrency: { name: 'SUI', symbol: 'SUI', decimals: 9 },
 *   rpcUrls: { default: { http: ['https://fullnode.testnet.sui.io:443'] } },
 *   connectParams: {
 *     methods: ['sui_signPersonalMessage'],
 *     chains: ['sui:testnet'],
 *     events: []
 *   }
 * }
 */

type ExtendedNamespaces = Omit<SessionTypes.Namespace, 'chains'> & {
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
  private provider: Awaited<ReturnType<typeof UniversalProvider.init>>
  private config: Config
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
    provider.on('display_uri', this.onDisplayUri.bind(this))
    provider.on('session_update', this.onSessionUpdate.bind(this))
    provider.on('session_delete', this.onSessionDelete.bind(this))
    provider.on('connect', this.onConnect.bind(this))
    provider.on('disconnect', this.onDisconnect.bind(this))
  }

  private onDisplayUri(uri: string) {
    console.log('display_uri', uri)
    this.appKit.open({ uri })
  }

  private onSessionUpdate(session: SessionTypes.Struct) {
    console.log('session_update', session)
  }

  private onSessionDelete(session: SessionTypes.Struct) {
    console.log('session_delete', session)
  }

  private onConnect(session: SessionTypes.Struct) {
    console.log('connect', session)
  }

  private onDisconnect() {
    this.session = undefined
    console.log('disconnect')
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
    provider: Awaited<ReturnType<typeof UniversalProvider.init>>
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

    console.log('>> Connecting...', namespaces)
    const session = await this.provider.connect({
      optionalNamespaces: namespaces as ConnectParams['optionalNamespaces']
    })

    this.session = session as SessionTypes.Struct

    console.log('session', session)

    await this.appKit.close()

    return { session: session as SessionTypes.Struct, provider: this.provider }
  }

  async disconnect() {
    await this.provider.disconnect()
    await this.appKit.close()
  }

  async request(params: RequestArguments, chain: string) {
    return await this.provider.request(params, chain)
  }
}

export default UniversalConnector
