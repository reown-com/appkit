import { AdapterBlueprint } from '@reown/appkit/adapters'
import type { CaipNetwork } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { type Provider } from '@reown/appkit-core'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import { type ProviderType } from '@reown/appkit-utils/ethers'
import { WcHelpersUtil, type AppKitOptions } from '@reown/appkit'
import UniversalProvider from '@walletconnect/universal-provider'
import { formatEther, InfuraProvider, JsonRpcProvider } from 'ethers'
import { CoinbaseWalletSDK, type ProviderInterface } from '@coinbase/wallet-sdk'

interface Info {
  uuid: string
  name: string
  icon: string
  rdns: string
}
export interface EIP6963ProviderDetail {
  info: Info
  provider: Provider
}

export class EthersAdapter extends AdapterBlueprint {
  private ethersConfig?: ProviderType

  constructor() {
    super({})
    this.namespace = CommonConstantsUtil.CHAIN.EVM
  }

  private createEthersConfig(options: AppKitOptions) {
    if (!options.metadata) {
      return undefined
    }
    let injectedProvider: Provider | undefined = undefined

    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    let coinbaseProvider: ProviderInterface | undefined = undefined

    function getInjectedProvider() {
      if (injectedProvider) {
        return injectedProvider
      }

      if (typeof window === 'undefined') {
        return undefined
      }

      if (!window.ethereum) {
        return undefined
      }

      //  @ts-expect-error window.ethereum satisfies Provider
      injectedProvider = window.ethereum

      return injectedProvider
    }

    function getCoinbaseProvider() {
      if (coinbaseProvider) {
        return coinbaseProvider
      }

      if (typeof window === 'undefined') {
        return undefined
      }

      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: options?.metadata?.name,
        appLogoUrl: options?.metadata?.icons[0],
        appChainIds: options.networks?.map(caipNetwork => caipNetwork.chainId as number) || [
          1, 84532
        ]
      })

      coinbaseProvider = coinbaseWallet.makeWeb3Provider({
        options: options.coinbasePreference ?? 'all'
      })

      return coinbaseProvider
    }

    const providers: ProviderType = { metadata: options.metadata }

    if (options.enableInjected !== false) {
      providers.injected = getInjectedProvider()
    }

    if (options.enableCoinbase !== false) {
      providers.coinbase = getCoinbaseProvider()
    }

    providers.EIP6963 = options.enableEIP6963 !== false

    return providers
  }

  public async syncConnection(
    id: string,
    caipNetworkId?: string
  ): Promise<AdapterBlueprint.ConnectResult> {
    const connector = this.connectors.find(c => c.id === id)
    const selectedProvider = connector?.provider as Provider
    const chainId = Number(caipNetworkId?.split(':')[1])

    if (selectedProvider) {
      const accounts: string[] = await selectedProvider.request({
        method: 'eth_requestAccounts'
      })

      return {
        address: accounts[0],
        chainId,
        provider: selectedProvider,
        type: connector?.type,
        id
      }
    }
  }

  public syncConnectors(options: AppKitOptions) {
    this.ethersConfig = this.createEthersConfig(options)
    if (this.ethersConfig?.EIP6963) {
      this.listenInjectedConnector(true)
    }

    const connectors = Object.keys(this.ethersConfig || {}).filter(
      key => key !== 'metadata' && key !== 'EIP6963'
    )

    connectors.forEach(connector => {
      const key = connector === 'coinbase' ? 'coinbaseWalletSDK' : connector
      if (this.namespace) {
        this.addConnector({
          id: connector,
          explorerId: PresetsUtil.ConnectorExplorerIds[key],
          imageUrl: options?.connectorImages?.[key],
          name: PresetsUtil.ConnectorNamesMap[key],
          imageId: PresetsUtil.ConnectorImageIds[key],
          type: PresetsUtil.ConnectorTypesMap[key] ?? 'EXTERNAL',
          info: { rdns: key },
          chain: this.namespace,
          chains: [],
          provider: this.ethersConfig?.[connector as keyof ProviderType] as Provider
        })
      }
    })
  }

  public async connectWalletConnect(onUri: (uri: string) => void) {
    const connector = this.connectors.find(c => c.type === 'WALLET_CONNECT')

    const provider = connector?.provider as UniversalProvider

    if (!this.caipNetworks || !provider) {
      throw new Error(
        'UniversalAdapter:connectWalletConnect - caipNetworks or provider is undefined'
      )
    }

    provider.on('display_uri', (uri: string) => {
      onUri(uri)
    })

    const namespaces = WcHelpersUtil.createNamespaces(this.caipNetworks)

    await provider.connect({ optionalNamespaces: namespaces })
  }

  private eip6963EventHandler(event: CustomEventInit<EIP6963ProviderDetail>) {
    if (event.detail) {
      const { info, provider } = event.detail
      const existingConnector = this.connectors?.find(c => c.name === info.name)
      const coinbaseConnector = this.connectors?.find(
        c => c.id === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID
      )
      const isCoinbaseDuplicated =
        coinbaseConnector &&
        event.detail.info.rdns ===
          ConstantsUtil.CONNECTOR_RDNS_MAP[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID]

      if (!existingConnector && !isCoinbaseDuplicated) {
        const type = PresetsUtil.ConnectorTypesMap[ConstantsUtil.EIP6963_CONNECTOR_ID]

        if (type && this.namespace) {
          this.addConnector({
            id: info.rdns,
            type,
            imageUrl: info.icon,
            name: info.name,
            provider,
            info,
            chain: this.namespace,
            chains: []
          })
        }
      }
    }
  }

  private listenInjectedConnector(enableEIP6963: boolean) {
    if (typeof window !== 'undefined' && enableEIP6963) {
      const handler = this.eip6963EventHandler.bind(this)
      window.addEventListener(ConstantsUtil.EIP6963_ANNOUNCE_EVENT, handler)
      window.dispatchEvent(new Event(ConstantsUtil.EIP6963_REQUEST_EVENT))
    }
  }

  public async connect({
    id,
    type,
    chainId
  }: {
    id: string
    provider?: Provider
    info?: unknown
    type: string
    chainId?: string | number
  }) {
    const connector = this.connectors.find(c => c.id === id)
    const selectedProvider = connector?.provider as Provider
    if (selectedProvider) {
      const accounts: string[] = await selectedProvider.request({
        method: 'eth_requestAccounts'
      })

      return {
        address: accounts[0],
        chainId: Number(chainId),
        provider: selectedProvider,
        type,
        id
      }
    }
  }

  public async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult | undefined> {
    const caipNetwork = this.caipNetworks?.find((c: CaipNetwork) => c.chainId === params.chainId)

    if (caipNetwork) {
      const jsonRpcProvider = new JsonRpcProvider(caipNetwork.rpcUrl, {
        chainId: caipNetwork.chainId as number,
        name: caipNetwork.name
      })

      const balance = await jsonRpcProvider.getBalance(params.address)
      const formattedBalance = formatEther(balance)

      return { balance: formattedBalance, symbol: caipNetwork.currency }
    }
  }

  public async getProfile(
    params: AdapterBlueprint.GetProfileParams
  ): Promise<AdapterBlueprint.GetProfileResult | undefined> {
    if (params.chainId === 1) {
      const ensProvider = new InfuraProvider('mainnet')
      const name = await ensProvider.lookupAddress(params.address)
      const avatar = await ensProvider.getAvatar(params.address)

      return { profileName: name || null, profileImage: avatar || null }
    }

    return { profileName: null, profileImage: null }
  }
}
