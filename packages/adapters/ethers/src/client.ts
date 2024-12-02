import { AdapterBlueprint } from '@reown/appkit/adapters'
import type { CaipNetwork } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  type CombinedProvider,
  type Connector,
  type ConnectorType,
  type Provider,
  CoreHelperUtil
} from '@reown/appkit-core'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import { EthersHelpersUtil, type ProviderType } from '@reown/appkit-utils/ethers'
import { WcConstantsUtil, WcHelpersUtil, type AppKitOptions } from '@reown/appkit'
import UniversalProvider from '@walletconnect/universal-provider'
import { formatEther, InfuraProvider, JsonRpcProvider } from 'ethers'
import { CoinbaseWalletSDK, type ProviderInterface } from '@coinbase/wallet-sdk'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { EthersMethods } from './utils/EthersMethods.js'
import { ProviderUtil } from '@reown/appkit/store'

export interface EIP6963ProviderDetail {
  info: Connector['info']
  provider: Provider
}

export class EthersAdapter extends AdapterBlueprint {
  private ethersConfig?: ProviderType
  public adapterType = 'ethers'

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
        appChainIds: options.networks?.map(caipNetwork => caipNetwork.id as number) || [1, 84532]
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

  public async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    const { message, address, provider } = params

    if (!provider) {
      throw new Error('Provider is undefined')
    }
    try {
      const signature = await EthersMethods.signMessage(message, provider as Provider, address)

      return { signature }
    } catch (error) {
      throw new Error('EthersAdapter:signMessage - Sign message failed')
    }
  }

  public async sendTransaction(
    params: AdapterBlueprint.SendTransactionParams
  ): Promise<AdapterBlueprint.SendTransactionResult> {
    if (!params.provider) {
      throw new Error('Provider is undefined')
    }

    const tx = await EthersMethods.sendTransaction(
      {
        value: params.value as bigint,
        to: params.to as `0x${string}`,
        data: params.data as `0x${string}`,
        gas: params.gas as bigint,
        gasPrice: params.gasPrice as bigint,
        address: params.address
      },
      params.provider as Provider,
      params.address,
      Number(params.caipNetwork?.id)
    )

    return { hash: tx }
  }

  public async writeContract(
    params: AdapterBlueprint.WriteContractParams
  ): Promise<AdapterBlueprint.WriteContractResult> {
    if (!params.provider) {
      throw new Error('Provider is undefined')
    }

    const result = await EthersMethods.writeContract(
      {
        abi: params.abi,
        method: params.method,
        fromAddress: params.caipAddress as `0x${string}`,
        receiverAddress: params.receiverAddress as `0x${string}`,
        tokenAmount: params.tokenAmount,
        tokenAddress: params.tokenAddress as `0x${string}`
      },
      params.provider as Provider,
      params.caipAddress,
      Number(params.caipNetwork?.id)
    )

    return { hash: result }
  }

  public async estimateGas(
    params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    const { provider, caipNetwork, address } = params
    if (!provider) {
      throw new Error('Provider is undefined')
    }

    try {
      const result = await EthersMethods.estimateGas(
        {
          data: params.data as `0x${string}`,
          to: params.to as `0x${string}`,
          address: address as `0x${string}`
        },
        provider as Provider,
        address as `0x${string}`,
        Number(caipNetwork?.id)
      )

      return { gas: result }
    } catch (error) {
      throw new Error('EthersAdapter:estimateGas - Estimate gas failed')
    }
  }

  public async getEnsAddress(
    params: AdapterBlueprint.GetEnsAddressParams
  ): Promise<AdapterBlueprint.GetEnsAddressResult> {
    const { name, caipNetwork } = params
    if (caipNetwork) {
      const result = await EthersMethods.getEnsAddress(name, caipNetwork)

      return { address: result as string }
    }

    return { address: '' }
  }

  public parseUnits(params: AdapterBlueprint.ParseUnitsParams): AdapterBlueprint.ParseUnitsResult {
    return EthersMethods.parseUnits(params.value, params.decimals)
  }

  public formatUnits(
    params: AdapterBlueprint.FormatUnitsParams
  ): AdapterBlueprint.FormatUnitsResult {
    return EthersMethods.formatUnits(params.value, params.decimals)
  }

  public async syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const { id, chainId } = params

    const connector = this.connectors.find(c => c.id === id)
    const selectedProvider = connector?.provider as Provider

    if (!selectedProvider) {
      throw new Error('Provider not found')
    }

    const accounts: string[] = await selectedProvider.request({
      method: 'eth_requestAccounts'
    })

    const requestChainId = await selectedProvider.request({
      method: 'eth_chainId'
    })

    this.listenProviderEvents(selectedProvider)

    if (!accounts[0]) {
      throw new Error('No accounts found')
    }

    if (!connector?.type) {
      throw new Error('Connector type not found')
    }

    return {
      address: accounts[0],
      chainId: Number(requestChainId) || Number(chainId),
      provider: selectedProvider,
      type: connector.type,
      id
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

      const injectedConnector = connector === ConstantsUtil.INJECTED_CONNECTOR_ID

      if (this.namespace) {
        this.addConnector({
          id: key,
          explorerId: PresetsUtil.ConnectorExplorerIds[key],
          imageUrl: options?.connectorImages?.[key],
          name: PresetsUtil.ConnectorNamesMap[key],
          imageId: PresetsUtil.ConnectorImageIds[key],
          type: PresetsUtil.ConnectorTypesMap[key] ?? 'EXTERNAL',
          info: injectedConnector ? undefined : { rdns: key },
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
      const existingConnector = this.connectors?.find(c => c.name === info?.name)

      if (!existingConnector) {
        const type = PresetsUtil.ConnectorTypesMap[ConstantsUtil.EIP6963_CONNECTOR_ID]

        if (type && this.namespace) {
          this.addConnector({
            id: info?.rdns || '',
            type,
            imageUrl: info?.icon,
            name: info?.name,
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
  }: AdapterBlueprint.ConnectParams): Promise<AdapterBlueprint.ConnectResult> {
    const connector = this.connectors.find(c => c.id === id)
    const selectedProvider = connector?.provider as Provider
    if (!selectedProvider) {
      throw new Error('Provider not found')
    }

    let accounts: string[] = []

    let requestChainId: string | undefined = undefined

    if (type === 'AUTH') {
      const { address } = await (selectedProvider as unknown as W3mFrameProvider).connect({
        chainId
      })

      accounts = [address]
    } else {
      accounts = await selectedProvider.request({
        method: 'eth_requestAccounts'
      })

      requestChainId = await selectedProvider.request({
        method: 'eth_chainId'
      })

      this.listenProviderEvents(selectedProvider)
    }

    return {
      address: accounts[0] as `0x${string}`,
      chainId: Number(requestChainId) || Number(chainId),
      provider: selectedProvider,
      type: type as ConnectorType,
      id
    }
  }

  public override async reconnect(params: AdapterBlueprint.ConnectParams): Promise<void> {
    const { id, chainId } = params

    const connector = this.connectors.find(c => c.id === id)

    if (connector && connector.type === 'AUTH' && chainId) {
      await (connector.provider as W3mFrameProvider).connect({ chainId })
    }
  }

  public async getAccounts(
    params: AdapterBlueprint.GetAccountsParams
  ): Promise<AdapterBlueprint.GetAccountsResult> {
    const connector = this.connectors.find(c => c.id === params.id)
    const selectedProvider = connector?.provider as Provider

    if (!selectedProvider || !connector) {
      throw new Error('Provider not found')
    }

    if (params.id === ConstantsUtil.AUTH_CONNECTOR_ID) {
      const provider = connector['provider'] as W3mFrameProvider
      const { address, accounts } = await provider.connect()

      return Promise.resolve({
        accounts: (accounts || [{ address, type: 'eoa' }]).map(account =>
          CoreHelperUtil.createAccount('eip155', account.address, account.type)
        )
      })
    }

    const accounts: string[] = await selectedProvider.request({
      method: 'eth_requestAccounts'
    })

    return {
      accounts: accounts.map(account => CoreHelperUtil.createAccount('eip155', account, 'eoa'))
    }
  }

  public async disconnect(params: AdapterBlueprint.DisconnectParams): Promise<void> {
    if (!params.provider || !params.providerType) {
      throw new Error('Provider or providerType not provided')
    }

    switch (params.providerType) {
      case 'WALLET_CONNECT':
        if ((params.provider as UniversalProvider).session) {
          ;(params.provider as UniversalProvider).disconnect()
        }
        break
      case 'AUTH':
        await params.provider.disconnect()
        break
      case 'ANNOUNCED':
      case 'EXTERNAL':
        await this.revokeProviderPermissions(params.provider as Provider)
        break
      default:
        throw new Error('Unsupported provider type')
    }
  }

  public async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const caipNetwork = this.caipNetworks?.find((c: CaipNetwork) => c.id === params.chainId)

    if (caipNetwork && caipNetwork.chainNamespace === 'eip155') {
      const jsonRpcProvider = new JsonRpcProvider(caipNetwork.rpcUrls.default.http[0], {
        chainId: caipNetwork.id as number,
        name: caipNetwork.name
      })

      if (jsonRpcProvider) {
        try {
          const balance = await jsonRpcProvider.getBalance(params.address)
          const formattedBalance = formatEther(balance)

          return { balance: formattedBalance, symbol: caipNetwork.nativeCurrency.symbol }
        } catch (error) {
          return { balance: '', symbol: '' }
        }
      }
    }

    return { balance: '', symbol: '' }
  }

  public async getProfile(
    params: AdapterBlueprint.GetProfileParams
  ): Promise<AdapterBlueprint.GetProfileResult> {
    if (params.chainId === 1) {
      const ensProvider = new InfuraProvider('mainnet')
      const name = await ensProvider.lookupAddress(params.address)
      const avatar = await ensProvider.getAvatar(params.address)

      return { profileName: name || undefined, profileImage: avatar || undefined }
    }

    return { profileName: undefined, profileImage: undefined }
  }

  private providerHandlers: {
    disconnect: () => void
    accountsChanged: (accounts: string[]) => void
    chainChanged: (chainId: string) => void
  } | null = null

  private listenProviderEvents(provider: Provider | CombinedProvider) {
    const disconnectHandler = () => {
      this.removeProviderListeners(provider)
      this.emit('disconnect')
    }

    const accountsChangedHandler = (accounts: string[]) => {
      if (accounts.length > 0) {
        this.emit('accountChanged', {
          address: accounts[0] as `0x${string}`
        })
      }
    }

    const chainChangedHandler = (chainId: string) => {
      const chainIdNumber =
        typeof chainId === 'string' ? EthersHelpersUtil.hexStringToNumber(chainId) : Number(chainId)

      this.emit('switchNetwork', { chainId: chainIdNumber })
    }

    provider.on('disconnect', disconnectHandler)
    provider.on('accountsChanged', accountsChangedHandler)
    provider.on('chainChanged', chainChangedHandler)

    this.providerHandlers = {
      disconnect: disconnectHandler,
      accountsChanged: accountsChangedHandler,
      chainChanged: chainChangedHandler
    }
  }

  private removeProviderListeners(provider: Provider | CombinedProvider) {
    if (this.providerHandlers) {
      provider.removeListener('disconnect', this.providerHandlers.disconnect)
      provider.removeListener('accountsChanged', this.providerHandlers.accountsChanged)
      provider.removeListener('chainChanged', this.providerHandlers.chainChanged)
      this.providerHandlers = null
    }
  }

  public async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    const { caipNetwork, provider, providerType } = params
    if (providerType === 'WALLET_CONNECT') {
      ;(provider as UniversalProvider).setDefaultChain(String(`eip155:${String(caipNetwork.id)}`))
    } else if (providerType === 'AUTH') {
      const authProvider = provider as W3mFrameProvider
      await authProvider.switchNetwork(caipNetwork.id)
      await authProvider.connect({
        chainId: caipNetwork.id
      })
    } else {
      try {
        await (provider as Provider).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: EthersHelpersUtil.numberToHexString(caipNetwork.id) }]
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (switchError: any) {
        if (
          switchError.code === WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
          switchError.code === WcConstantsUtil.ERROR_CODE_DEFAULT ||
          switchError?.data?.originalError?.code ===
            WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
        ) {
          await EthersHelpersUtil.addEthereumChain(provider as Provider, caipNetwork)
        } else if (
          providerType === 'ANNOUNCED' ||
          providerType === 'EXTERNAL' ||
          providerType === 'INJECTED'
        ) {
          throw new Error('Chain is not supported')
        }
      }
    }
  }

  public getWalletConnectProvider(): AdapterBlueprint.GetWalletConnectProviderResult {
    return this.connectors.find(c => c.type === 'WALLET_CONNECT')?.provider as UniversalProvider
  }

  private async revokeProviderPermissions(provider: Provider | CombinedProvider) {
    try {
      const permissions: { parentCapability: string }[] = await provider.request({
        method: 'wallet_getPermissions'
      })
      const ethAccountsPermission = permissions.find(
        permission => permission.parentCapability === 'eth_accounts'
      )

      if (ethAccountsPermission) {
        await provider.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        })
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.info('Could not revoke permissions from wallet. Disconnecting...', error)
    }
  }

  public async getCapabilities(params: AdapterBlueprint.GetCapabilitiesParams): Promise<unknown> {
    const provider = ProviderUtil.getProvider(CommonConstantsUtil.CHAIN.EVM)

    if (!provider) {
      throw new Error('Provider is undefined')
    }

    const walletCapabilitiesString = provider.session?.sessionProperties?.['capabilities']
    if (walletCapabilitiesString) {
      const walletCapabilities = EthersMethods.parseWalletCapabilities(walletCapabilitiesString)
      const accountCapabilities = walletCapabilities[params]
      if (accountCapabilities) {
        return accountCapabilities
      }
    }

    return await provider.request({ method: 'wallet_getCapabilities', params: [params] })
  }

  public async grantPermissions(params: AdapterBlueprint.GrantPermissionsParams): Promise<unknown> {
    const provider = ProviderUtil.getProvider(CommonConstantsUtil.CHAIN.EVM)

    if (!provider) {
      throw new Error('Provider is undefined')
    }

    return await provider.request({ method: 'wallet_grantPermissions', params })
  }

  public async revokePermissions(
    params: AdapterBlueprint.RevokePermissionsParams
  ): Promise<`0x${string}`> {
    const provider = ProviderUtil.getProvider(CommonConstantsUtil.CHAIN.EVM)

    if (!provider) {
      throw new Error('Provider is undefined')
    }

    return await provider.request({ method: 'wallet_revokePermissions', params: [params] })
  }
}
