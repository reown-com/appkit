import type UniversalProvider from '@walletconnect/universal-provider'
import type { CaipNetwork } from '@reown/appkit-common'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import {
  connect,
  disconnect as wagmiDisconnect,
  createConfig,
  type Config,
  type CreateConfigParameters,
  type CreateConnectorFn,
  getConnections,
  switchChain,
  injected,
  type Connector,
  watchAccount,
  watchChainId,
  watchConnections
} from '@wagmi/core'
import { type Chain } from '@wagmi/core/chains'
import { convertToAppKitChains, getTransport } from './utils/helpers.js'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { authConnector } from './connectors/AuthConnector.js'
import { AppKit, type AppKitOptions } from '@reown/appkit'
import { walletConnect } from './connectors/UniversalConnector.js'
import { coinbaseWallet } from '@wagmi/connectors'
import {
  ConstantsUtil as CoreConstantsUtil,
  type ConnectorType,
  type Provider
} from '@reown/appkit-core'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import type { ConnectExternalOptions } from '../../../core/dist/types/src/controllers/ConnectionController.js'
export class WagmiAdapter extends AdapterBlueprint {
  public wagmiChains: readonly [Chain, ...Chain[]] | undefined

  public wagmiConfig!: Config

  constructor(
    configParams: Partial<CreateConfigParameters> & {
      networks: CaipNetwork[]
      projectId: string
    }
  ) {
    super({ projectId: configParams.projectId, networks: configParams.networks })
    this.namespace = CommonConstantsUtil.CHAIN.EVM
    this.createConfig(configParams)

    watchAccount(this.wagmiConfig, {
      onChange: accountData => {
        if (accountData.address) {
          this.emit('accountChanged', accountData.address)
        }
        if (accountData.chainId) {
          this.emit('switchNetwork', accountData.chainId)
        }
      }
    })

    watchConnections(this.wagmiConfig, {
      onChange: connections => {
        if (connections.length === 0) {
          this.emit('disconnect')
        }
      }
    })
  }

  private createConfig(
    configParams: Partial<CreateConfigParameters> & {
      networks: CaipNetwork[]
      projectId: string
    }
  ) {
    this.wagmiChains = convertToAppKitChains(
      this.caipNetworks?.filter(
        caipNetwork => caipNetwork.chainNamespace === CommonConstantsUtil.CHAIN.EVM
      ) ?? []
    )

    const transportsArr = this.wagmiChains.map(chain => [
      chain.id,
      getTransport({ chain, projectId: configParams.projectId })
    ])

    const transports = Object.fromEntries(transportsArr)
    const connectors: CreateConnectorFn[] = [...(configParams.connectors ?? [])]

    this.wagmiConfig = createConfig({
      ...configParams,
      chains: this.wagmiChains,
      transports,
      connectors: [...connectors, ...(configParams.connectors ?? [])]
    })
  }

  private addWagmiConnectors(options: AppKitOptions, appKit: AppKit) {
    const customConnectors: CreateConnectorFn[] = []

    if (options.enableWalletConnect !== false) {
      customConnectors.push(walletConnect(options, appKit))
    }

    if (options.enableInjected !== false) {
      customConnectors.push(injected({ shimDisconnect: true }))
    }

    if (options.enableCoinbase !== false) {
      customConnectors.push(
        coinbaseWallet({
          version: '4',
          appName: options.metadata?.name ?? 'Unknown',
          appLogoUrl: options.metadata?.icons[0] ?? 'Unknown',
          preference: options.coinbasePreference ?? 'all'
        })
      )
    }

    const emailEnabled =
      options.features?.email === undefined
        ? CoreConstantsUtil.DEFAULT_FEATURES.email
        : options.features?.email
    const socialsEnabled = options.features?.socials
      ? options.features?.socials?.length > 0
      : CoreConstantsUtil.DEFAULT_FEATURES.socials

    if (emailEnabled || socialsEnabled) {
      customConnectors.push(
        authConnector({
          chains: this.wagmiChains,
          options: { projectId: options.projectId }
        })
      )
    }

    customConnectors.forEach(connector => {
      const cnctr = this.wagmiConfig._internal.connectors.setup(connector)
      this.wagmiConfig._internal.connectors.setState(prev => [...prev, cnctr])
    })
  }

  public async syncConnectors(options: AppKitOptions, appKit: AppKit) {
    this.addWagmiConnectors(options, appKit)

    const connectors = this.wagmiConfig.connectors.map(connector => ({
      ...connector,
      chain: this.namespace
    }))

    const uniqueIds = new Set()
    const filteredConnectors = connectors.filter(item => {
      const isDuplicate = uniqueIds.has(item.id)
      uniqueIds.add(item.id)

      return !isDuplicate
    })

    await Promise.all(
      filteredConnectors.map(async ({ id, name, type, icon, getProvider }) => {
        // Auth connector is initialized separately
        const shouldSkip = ConstantsUtil.AUTH_CONNECTOR_ID === id
        const provider = (await getProvider()) as Provider

        if (!shouldSkip && this.namespace && provider) {
          this.addConnector({
            id,
            explorerId: PresetsUtil.ConnectorExplorerIds[id],
            imageUrl: options?.connectorImages?.[id] ?? icon,
            name: PresetsUtil.ConnectorNamesMap[id] ?? name,
            imageId: PresetsUtil.ConnectorImageIds[id],
            type: PresetsUtil.ConnectorTypesMap[type] ?? 'EXTERNAL',
            info: {
              rdns: id
            },
            chain: this.namespace,
            chains: [],
            provider
          })
        }
      })
    )
  }

  public async syncConnection(type: ConnectorType): Promise<ConnectExternalOptions> {
    const connections = getConnections(this.wagmiConfig)

    const connection = connections.find(c => c.connector.type === type.toLowerCase())

    const connector = this.wagmiConfig.connectors.find(c => c.type === type.toLowerCase())

    const provider = (await connector?.getProvider()) as Provider

    return {
      chainId: connection?.chainId,
      address: connection?.accounts[0] as string,
      provider,
      type
    }
  }

  public async connectWalletConnect(onUri: (uri: string) => void, chainId?: number | string) {
    const connector = this.wagmiConfig.connectors.find(
      c => c.type === 'walletConnect'
    ) as unknown as Connector

    const provider = (await connector.getProvider()) as UniversalProvider

    if (!this.caipNetworks || !provider) {
      throw new Error(
        'UniversalAdapter:connectWalletConnect - caipNetworks or provider is undefined'
      )
    }

    provider.on('display_uri', (uri: string) => {
      onUri(uri)
    })

    await connect(this.wagmiConfig, { connector, chainId: chainId ? Number(chainId) : undefined })
  }

  public async connect({
    id,
    provider,
    type,
    info,
    chainId
  }: {
    id: string
    provider?: unknown
    info?: unknown
    type: string
    chainId?: number | string
  }) {
    const connector = this.wagmiConfig.connectors.find(c => c.id === id)
    if (!connector) {
      throw new Error('connectionControllerClient:connectExternal - connector is undefined')
    }
    if (provider && info && connector.id === ConstantsUtil.EIP6963_CONNECTOR_ID) {
      // @ts-expect-error Exists on EIP6963Connector
      connector.setEip6963Wallet?.({ provider, info })
    }

    const res = await connect(this.wagmiConfig, {
      connector,
      chainId: chainId ? Number(chainId) : undefined
    })

    return { address: res.accounts[0] as string, type, provider, chainId }
  }

  public async disconnect() {
    const connections = getConnections(this.wagmiConfig)
    await Promise.all(
      connections.map(async connection => {
        const connector = connection?.connector

        if (connector) {
          await wagmiDisconnect(this.wagmiConfig, { connector })
        }
      })
    )

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async switchNetwork(caipNetwork: CaipNetwork) {
    await switchChain(this.wagmiConfig, { chainId: caipNetwork.chainId as number })
  }
}
