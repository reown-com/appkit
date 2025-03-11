import UniversalProvider from '@walletconnect/universal-provider'
import { InfuraProvider, JsonRpcProvider, formatEther } from 'ethers'

import { type AppKitOptions, WcConstantsUtil } from '@reown/appkit'
import { ConstantsUtil as CommonConstantsUtil, ParseUtil } from '@reown/appkit-common'
import {
  type CombinedProvider,
  type Connector,
  type ConnectorType,
  CoreHelperUtil,
  OptionsController,
  type Provider,
  StorageUtil
} from '@reown/appkit-core'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import { EthersHelpersUtil, type ProviderType } from '@reown/appkit-utils/ethers'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import { WalletConnectConnector } from '@reown/appkit/connectors'
import { ProviderUtil } from '@reown/appkit/store'

import { EthersMethods } from './utils/EthersMethods.js'

export interface EIP6963ProviderDetail {
  info: Connector['info']
  provider: Provider
}

export class EthersAdapter extends AdapterBlueprint {
  private ethersConfig?: ProviderType
  public adapterType = 'ethers'
  private balancePromises: Record<string, Promise<AdapterBlueprint.GetBalanceResult>> = {}

  constructor() {
    super({})
    this.namespace = CommonConstantsUtil.CHAIN.EVM
  }

  private async createEthersConfig(options: AppKitOptions) {
    if (!options.metadata) {
      return undefined
    }
    let injectedProvider: Provider | undefined = undefined

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

    async function getCoinbaseProvider() {
      try {
        const { createCoinbaseWalletSDK } = await import('@coinbase/wallet-sdk')

        if (typeof window === 'undefined') {
          return undefined
        }

        const coinbaseSdk = createCoinbaseWalletSDK({
          appName: options?.metadata?.name,
          appLogoUrl: options?.metadata?.icons[0],
          appChainIds: options.networks?.map(caipNetwork => caipNetwork.id as number) || [1, 84532],
          preference: {
            options: options.coinbasePreference ?? 'all'
          }
        })

        return coinbaseSdk.getProvider()
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to import Coinbase Wallet SDK:', error)

        return undefined
      }
    }

    const providers: ProviderType = { metadata: options.metadata }

    if (options.enableInjected !== false) {
      providers.injected = getInjectedProvider()
    }

    if (options.enableCoinbase !== false) {
      const coinbaseProvider = await getCoinbaseProvider()

      if (coinbaseProvider) {
        providers.coinbase = coinbaseProvider
      }
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

    const { address } = ParseUtil.parseCaipAddress(params.caipAddress)
    const result = await EthersMethods.writeContract(
      params,
      params.provider as Provider,
      address,
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

  override async syncConnectors(options: AppKitOptions): Promise<void> {
    this.ethersConfig = await this.createEthersConfig(options)

    if (this.ethersConfig?.EIP6963) {
      this.listenInjectedConnector(true)
    }

    const connectors = Object.keys(this.ethersConfig || {}).filter(
      key => key !== 'metadata' && key !== 'EIP6963'
    )

    connectors.forEach(connector => {
      const key = connector === 'coinbase' ? 'coinbaseWalletSDK' : connector

      const isInjectedConnector = connector === CommonConstantsUtil.CONNECTOR_ID.INJECTED

      if (this.namespace) {
        this.addConnector({
          id: key,
          explorerId: PresetsUtil.ConnectorExplorerIds[key],
          imageUrl: options?.connectorImages?.[key],
          name: PresetsUtil.ConnectorNamesMap[key] || 'Unknown',
          imageId: PresetsUtil.ConnectorImageIds[key],
          type: PresetsUtil.ConnectorTypesMap[key] ?? 'EXTERNAL',
          info: isInjectedConnector ? undefined : { rdns: key },
          chain: this.namespace,
          chains: [],
          provider: this.ethersConfig?.[connector as keyof ProviderType] as Provider
        })
      }
    })
  }

  public override setUniversalProvider(universalProvider: UniversalProvider): void {
    this.addConnector(
      new WalletConnectConnector({
        provider: universalProvider,
        caipNetworks: this.caipNetworks || [],
        namespace: 'eip155'
      })
    )
  }

  private eip6963EventHandler(event: CustomEventInit<EIP6963ProviderDetail>) {
    if (event.detail) {
      const { info, provider } = event.detail
      const existingConnector = this.connectors?.find(c => c.name === info?.name)

      if (!existingConnector) {
        const type = PresetsUtil.ConnectorTypesMap[CommonConstantsUtil.CONNECTOR_ID.EIP6963]

        const id = info?.rdns || info?.name || info?.uuid
        if (type && this.namespace && id) {
          this.addConnector({
            id,
            type,
            imageUrl: info?.icon,
            name: info?.name || 'Unknown',
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
        chainId,
        preferredAccountType: OptionsController.state.defaultAccountTypes.eip155
      })

      accounts = [address]
    } else {
      accounts = await selectedProvider.request({
        method: 'eth_requestAccounts'
      })

      requestChainId = await selectedProvider.request({
        method: 'eth_chainId'
      })

      if (requestChainId !== chainId) {
        const caipNetwork = this.caipNetworks?.find(n => n.id === chainId)

        if (!caipNetwork) {
          throw new Error('EthersAdapter:connect - could not find the caipNetwork to switch')
        }

        try {
          await this.switchNetwork({
            caipNetwork,
            provider: selectedProvider,
            providerType: type as ConnectorType
          })
        } catch (error) {
          throw new Error('EthersAdapter:connect - Switch network failed')
        }
      }

      this.listenProviderEvents(selectedProvider)
    }

    return {
      address: accounts[0] as `0x${string}`,
      chainId: Number(chainId),
      provider: selectedProvider,
      type: type as ConnectorType,
      id
    }
  }

  public override async reconnect(params: AdapterBlueprint.ConnectParams): Promise<void> {
    const { id, chainId } = params

    const connector = this.connectors.find(c => c.id === id)

    if (connector && connector.type === 'AUTH' && chainId) {
      await (connector.provider as W3mFrameProvider).connect({
        chainId,
        preferredAccountType: OptionsController.state.defaultAccountTypes.eip155
      })
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

    if (params.id === CommonConstantsUtil.CONNECTOR_ID.AUTH) {
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
    const address = params.address
    const caipNetwork = this.caipNetworks?.find(network => network.id === params.chainId)

    if (!address) {
      return Promise.resolve({ balance: '0.00', symbol: 'ETH' })
    }

    if (caipNetwork && caipNetwork.chainNamespace === 'eip155') {
      const caipAddress = `${caipNetwork.caipNetworkId}:${address}`

      const cachedPromise = this.balancePromises[caipAddress]
      if (cachedPromise) {
        return cachedPromise
      }
      const cachedBalance = StorageUtil.getNativeBalanceCacheForCaipAddress(caipAddress)
      if (cachedBalance) {
        return { balance: cachedBalance.balance, symbol: cachedBalance.symbol }
      }

      const jsonRpcProvider = new JsonRpcProvider(caipNetwork.rpcUrls.default.http[0], {
        chainId: caipNetwork.id as number,
        name: caipNetwork.name
      })

      if (jsonRpcProvider) {
        try {
          this.balancePromises[caipAddress] = new Promise<AdapterBlueprint.GetBalanceResult>(
            async resolve => {
              const balance = await jsonRpcProvider.getBalance(address)

              const formattedBalance = formatEther(balance)

              StorageUtil.updateNativeBalanceCache({
                caipAddress,
                balance: formattedBalance,
                symbol: caipNetwork.nativeCurrency.symbol,
                timestamp: Date.now()
              })

              resolve({ balance: formattedBalance, symbol: caipNetwork.nativeCurrency.symbol })
            }
          ).finally(() => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.balancePromises[caipAddress]
          })

          return this.balancePromises[caipAddress] || { balance: '0.00', symbol: 'ETH' }
        } catch (error) {
          return { balance: '0.00', symbol: 'ETH' }
        }
      }
    }

    return { balance: '0.00', symbol: 'ETH' }
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
    const disconnect = () => {
      this.removeProviderListeners(provider)
      this.emit('disconnect')
    }

    const accountsChangedHandler = (accounts: string[]) => {
      if (accounts.length > 0) {
        this.emit('accountChanged', {
          address: accounts[0] as `0x${string}`
        })
      } else {
        disconnect()
      }
    }

    const chainChangedHandler = (chainId: string) => {
      const chainIdNumber =
        typeof chainId === 'string' ? EthersHelpersUtil.hexStringToNumber(chainId) : Number(chainId)

      this.emit('switchNetwork', { chainId: chainIdNumber })
    }

    provider.on('disconnect', disconnect)
    provider.on('accountsChanged', accountsChangedHandler)
    provider.on('chainChanged', chainChangedHandler)

    this.providerHandlers = {
      disconnect,
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

  public override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    const { caipNetwork, provider, providerType } = params

    if (providerType === 'AUTH') {
      await super.switchNetwork(params)

      return
    }

    try {
      await (provider as Provider).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EthersHelpersUtil.numberToHexString(caipNetwork.id) }]
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (switchError: any) {
      if (
        switchError.code === WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
        switchError.code === WcConstantsUtil.ERROR_INVALID_CHAIN_ID ||
        switchError.code === WcConstantsUtil.ERROR_CODE_DEFAULT ||
        switchError?.data?.originalError?.code === WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
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

  public async walletGetAssets(
    params: AdapterBlueprint.WalletGetAssetsParams
  ): Promise<AdapterBlueprint.WalletGetAssetsResponse> {
    const provider = ProviderUtil.getProvider(CommonConstantsUtil.CHAIN.EVM)

    if (!provider) {
      throw new Error('Provider is undefined')
    }

    return await provider.request({
      method: 'wallet_getAssets',
      params: [params]
    })
  }
}
