import type { ProposalTypes, SessionTypes } from '@walletconnect/types'
import { UniversalProvider } from '@walletconnect/universal-provider'

import type { CreateAppKit } from '@reown/appkit'
import type { CaipNetwork, InferredCaipNetwork } from '@reown/appkit-common'
import { AppKit, type Metadata, createAppKit } from '@reown/appkit/core'

const suiMainnet = {
  id: 784,
  chainNamespace: 'sui' as const,
  caipNetworkId: 'sui:mainnet',
  name: 'Sui',
  nativeCurrency: { name: 'SUI', symbol: 'SUI', decimals: 9 },
  rpcUrls: { default: { http: ['https://fullnode.mainnet.sui.io:443'] } },
  connectParams: {
    methods: ['sui_signPersonalMessage'],
    chains: ['sui:mainnet'],
    events: []
  }
}

const suiTestnet = {
  id: 784,
  chainNamespace: 'sui' as const,
  caipNetworkId: 'sui:testnet',
  name: 'Sui',
  nativeCurrency: { name: 'SUI', symbol: 'SUI', decimals: 9 },
  rpcUrls: { default: { http: ['https://fullnode.testnet.sui.io:443'] } },
  connectParams: {
    methods: ['sui_signPersonalMessage'],
    chains: ['sui:testnet'],
    events: []
  }
}

const networks = [
  {
    namespace: 'sui',
    name: 'Sui',
    methods: ['sui_signPersonalMessage'],
    chains: [suiMainnet, suiTestnet],
    events: []
  }
]

type ExtendedNamespaces = Omit<SessionTypes.Namespace, 'chains'> & {
  chains: InferredCaipNetwork[]
  namespace: string
}

type Config = {
  projectId: string
  metadata: Metadata
  networks: ExtendedNamespaces[]
}

class UniversalConnector {
  private appKit: AppKit
  private provider: Awaited<ReturnType<typeof UniversalProvider.init>>
  private config: Config

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

  private onDisplayUri(uri: string) {
    this.appKit.open({ uri })
  }

  private async init(config: Config) {
    this.config = config
    const provider = await UniversalProvider.init({
      projectId: config.projectId,
      metadata: config.metadata
    })

    this.provider = provider

    this.provider?.on('display_uri', (uri: string) => {
      this.onDisplayUri(uri)
    })

    const appKitConfig: CreateAppKit = {
      networks: Object.values(config.networks).flatMap(network => network.chains) as [
        CaipNetwork,
        ...CaipNetwork[]
      ],
      projectId: config.projectId,
      metadata: config.metadata,
      universalProvider: this.provider,
      manualWCControl: true
    }
    this.appKit = createAppKit(appKitConfig)
  }

  async connect() {
    const namespaces: ProposalTypes.OptionalNamespaces =
      this.config?.networks.reduce<ProposalTypes.OptionalNamespaces>((acc, namespace) => {
        acc[namespace.namespace] = {
          ...namespace,
          chains: namespace.chains.map((chain: InferredCaipNetwork) => chain.caipNetworkId)
        }
        return acc
      }, {})
    const session = await this.provider.connect({
      optionalNamespaces: namespaces as any
    })
    await this.appKit.close()

    return { session, provider: this.provider }
  }

  async disconnect() {
    await this.provider.disconnect()
    await this.appKit.close()
  }
}

export default UniversalConnector
