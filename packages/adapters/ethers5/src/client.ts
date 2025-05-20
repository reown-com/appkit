import UniversalProvider from '@walletconnect/universal-provider'
import * as ethers from 'ethers'
import { formatEther } from 'ethers/lib/utils.js'

import { type AppKitOptions, WcConstantsUtil } from '@reown/appkit'
import { ConstantsUtil as CommonConstantsUtil, ParseUtil } from '@reown/appkit-common'
import {
  AccountController,
  type CombinedProvider,
  type Connector,
  type ConnectorType,
  CoreHelperUtil,
  type Provider,
  StorageUtil
} from '@reown/appkit-controllers'
import { ConnectorUtil } from '@reown/appkit-scaffold-ui/utils'
import { ConstantsUtil, HelpersUtil, PresetsUtil } from '@reown/appkit-utils'
import { ProviderUtil } from '@reown/appkit-utils'
import { type Address, EthersHelpersUtil, type ProviderType } from '@reown/appkit-utils/ethers'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import { WalletConnectConnector } from '@reown/appkit/connectors'

import { Ethers5Methods } from './utils/Ethers5Methods.js'

export interface EIP6963ProviderDetail {
  info: Connector['info']
  provider: Provider
}

export class Ethers5Adapter extends AdapterBlueprint {
  private ethersConfig?: ProviderType
  private balancePromises: Record<string, Promise<AdapterBlueprint.GetBalanceResult>> = {}

  constructor() {
    super({
      adapterType: CommonConstantsUtil.ADAPTER_TYPES.ETHERS5,
      namespace: CommonConstantsUtil.CHAIN.EVM
    })
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
      const signature = await Ethers5Methods.signMessage(message, provider as Provider, address)

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

    const tx = await Ethers5Methods.sendTransaction(
      {
        value: Number.isNaN(Number(params.value)) ? BigInt(0) : BigInt(params.value),
        to: params.to as Address,
        data: params.data ? (params.data as Address) : '0x',
        gas: params.gas ? BigInt(params.gas) : undefined,
        gasPrice: params.gasPrice ? BigInt(params.gasPrice) : undefined,
        address: AccountController.state.address as Address
      },
      params.provider as Provider,
      AccountController.state.address as Address,
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
    const result = await Ethers5Methods.writeContract(
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
      const result = await Ethers5Methods.estimateGas(
        {
          data: params.data as Address,
          to: params.to as Address,
          address: address as Address
        },
        provider as Provider,
        address as Address,
        Number(caipNetwork?.id)
      )

      return { gas: result }
    } catch (error) {
      throw new Error('EthersAdapter:estimateGas - Estimate gas failed')
    }
  }

  public parseUnits(params: AdapterBlueprint.ParseUnitsParams): AdapterBlueprint.ParseUnitsResult {
    return Ethers5Methods.parseUnits(params.value, params.decimals)
  }

  public formatUnits(
    params: AdapterBlueprint.FormatUnitsParams
  ): AdapterBlueprint.FormatUnitsResult {
    return Ethers5Methods.formatUnits(params.value, params.decimals)
  }

  public async syncConnection(
    params: Pick<AdapterBlueprint.SyncConnectionParams, 'id' | 'chainId'>
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

    this.listenProviderEvents(id, selectedProvider)

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

  public async disconnectAll() {
    const connections = await Promise.all(
      this.connections.map(async connection => {
        const connector = this.connectors.find(c =>
          HelpersUtil.isLowerCaseMatch(c.id, connection.connectorId)
        )

        if (!connector) {
          throw new Error('Connector not found')
        }

        await this.disconnect({
          id: connector.id
        })

        return connection
      })
    )

    return { connections }
  }

  public async syncConnections({
    connectToFirstConnector,
    getConnectorStorageInfo
  }: AdapterBlueprint.SyncConnectionsParams) {
    await Promise.allSettled(
      this.connectors
        .filter(c => {
          const { isDisconnected } = getConnectorStorageInfo(c.id)

          return !isDisconnected
        })
        .map(async connector => {
          const { accounts, chainId } = await ConnectorUtil.fetchProviderData(connector)

          if (accounts.length > 0 && chainId) {
            const caipNetwork = this.getCaipNetworks().find(network => network.id === chainId)

            this.addConnection({
              connectorId: connector.id,
              accounts: accounts.map(account => ({ address: account })),
              caipNetwork
            })

            if (connector.provider && connector.id !== CommonConstantsUtil.CONNECTOR_ID.AUTH) {
              this.listenProviderEvents(
                connector.id,
                connector.provider as Provider | CombinedProvider
              )
            }
          }
        })
    )

    if (connectToFirstConnector) {
      this.chooseFirstConnectionAndEmit()
    }
  }

  public override setUniversalProvider(universalProvider: UniversalProvider): void {
    // eslint-disable-next-line @typescript-eslint/require-await
    universalProvider.on('connect', async () => {
      const namespaceAccounts = universalProvider?.session?.namespaces?.['eip155']?.accounts || []

      if (namespaceAccounts.length > 0) {
        const parsedCaipAddresses = namespaceAccounts.map(account => {
          const caipAddress = ParseUtil.validateCaipAddress(account)
          const { address, chainId } = ParseUtil.parseCaipAddress(caipAddress)

          return { address, chainId }
        })

        const caipNetwork = this.getCaipNetworks().find(
          n => n.id === parsedCaipAddresses[0]?.chainId
        )

        const allAddresses = new Set(
          parsedCaipAddresses.map(({ address }) => address.toLowerCase())
        )

        this.addConnection({
          connectorId: CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT,
          accounts: Array.from(allAddresses).map(address => ({ address })),
          caipNetwork
        })
      }
    })

    this.addConnector(
      new WalletConnectConnector({
        provider: universalProvider,
        caipNetworks: this.getCaipNetworks(),
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
    const connector = this.connectors.find(c => HelpersUtil.isLowerCaseMatch(c.id, id))

    if (!connector) {
      throw new Error('Connector not found')
    }

    const connection = this.connections.find(c => c.connectorId === id)

    if (connection) {
      const [account] = connection.accounts

      if (account) {
        this.emit('accountChanged', {
          address: account.address,
          chainId: Number(connection.caipNetwork?.id ?? 1),
          connector
        })

        return {
          address: account.address,
          chainId: Number(connection.caipNetwork?.id ?? 1),
          provider: connector.provider,
          type: connector.type,
          id
        }
      }
    }

    const selectedProvider = connector?.provider as Provider

    if (!selectedProvider) {
      throw new Error('Provider not found')
    }

    let accounts: string[] = []

    let requestChainId: string | undefined = undefined

    if (type === 'AUTH') {
      const { address, accounts: authAccounts } = await (
        selectedProvider as unknown as W3mFrameProvider
      ).connect({
        chainId,
        preferredAccountType: AccountController.state.preferredAccountTypes?.eip155
      })

      const caipNetwork = this.getCaipNetworks().find(n => n.id === chainId)

      this.addConnection({
        connectorId: id,
        accounts: authAccounts
          ? authAccounts.map(account => ({ address: account.address }))
          : [{ address }],
        caipNetwork,
        auth: {
          name: StorageUtil.getConnectedSocialProvider(),
          username: StorageUtil.getConnectedSocialUsername()
        }
      })
    } else {
      accounts = await selectedProvider.request({
        method: 'eth_requestAccounts'
      })

      requestChainId = await selectedProvider.request({
        method: 'eth_chainId'
      })

      const caipNetwork = this.getCaipNetworks().find(n => n.id === chainId)

      if (requestChainId !== chainId) {
        if (!caipNetwork) {
          throw new Error('Ethers5Adapter:connect - could not find the caipNetwork to switch')
        }

        try {
          await this.switchNetwork({
            caipNetwork,
            provider: selectedProvider,
            providerType: type as ConnectorType
          })
        } catch (error) {
          throw new Error('Ethers5Adapter:connect - Switch network failed')
        }
      }

      this.emit('accountChanged', {
        address: accounts[0] as Address,
        chainId: Number(chainId),
        connector
      })

      this.addConnection({
        connectorId: id,
        accounts: accounts.map(account => ({ address: account })),
        caipNetwork
      })

      this.listenProviderEvents(id, selectedProvider)
    }

    return {
      address: accounts[0] as Address,
      chainId: Number(chainId),
      provider: selectedProvider,
      type: type as ConnectorType,
      id
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

    const connection = this.connections.find(c => c.connectorId === params.id)

    if (connection) {
      return {
        accounts: connection.accounts.map(({ address }) =>
          CoreHelperUtil.createAccount('eip155', address, 'eoa')
        )
      }
    }

    if (params.id === CommonConstantsUtil.CONNECTOR_ID.AUTH) {
      const provider = connector['provider'] as W3mFrameProvider
      if (!provider.user) {
        return { accounts: [] }
      }
      const { accounts, address } = provider.user

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

  public override async reconnect(params: AdapterBlueprint.ConnectParams): Promise<void> {
    const { id, chainId } = params

    const connector = this.connectors.find(c => c.id === id)

    if (connector && connector.type === 'AUTH' && chainId) {
      await (connector.provider as W3mFrameProvider).connect({
        chainId,
        preferredAccountType: AccountController.state.preferredAccountTypes?.eip155
      })
    }
  }

  public async disconnect(params: AdapterBlueprint.DisconnectParams): Promise<void> {
    const connector = this.connectors.find(c => HelpersUtil.isLowerCaseMatch(c.id, params.id))

    if (!connector) {
      throw new Error('Connector not found')
    }

    switch (connector.type) {
      case 'WALLET_CONNECT':
        if ((connector.provider as UniversalProvider).session) {
          ;(connector.provider as UniversalProvider).disconnect()
        }
        break
      case 'AUTH':
        await connector.provider?.disconnect()
        break
      case 'ANNOUNCED':
      case 'EXTERNAL':
        await this.revokeProviderPermissions(connector.provider as Provider)
        break
      default:
        throw new Error('Unsupported provider type')
    }

    if (connector.id) {
      this.removeProviderListeners(connector.id)
      this.deleteConnection(connector.id)
    }

    if (this.connections.length === 0) {
      this.emit('disconnect')
    } else {
      const [lastConnection] = this.connections.filter(c => c.accounts.length > 0)

      if (
        lastConnection &&
        HelpersUtil.isLowerCaseMatch(connector.id, this.getConnectorId('eip155'))
      ) {
        const [account] = lastConnection.accounts

        const newConnector = this.connectors.find(c =>
          HelpersUtil.isLowerCaseMatch(c.id, lastConnection.connectorId)
        )

        if (account) {
          this.emit('accountChanged', {
            address: account.address,
            chainId: Number(lastConnection.caipNetwork?.id ?? 1),
            connector: newConnector
          })
        }
      }
    }
  }

  public async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const address = params.address
    const caipNetwork = this.getCaipNetworks().find(network => network.id === params.chainId)

    if (!address) {
      return Promise.resolve({ balance: '0.00', symbol: 'ETH' })
    }

    if (caipNetwork) {
      const caipAddress = `${caipNetwork.caipNetworkId}:${address}`

      const cachedPromise = this.balancePromises[caipAddress]
      if (cachedPromise) {
        return cachedPromise
      }

      const cachedBalance = StorageUtil.getNativeBalanceCacheForCaipAddress(caipAddress)
      if (cachedBalance) {
        return { balance: cachedBalance.balance, symbol: cachedBalance.symbol }
      }

      const jsonRpcProvider = new ethers.providers.JsonRpcProvider(
        caipNetwork.rpcUrls.default.http[0],
        {
          chainId: caipNetwork.id as number,
          name: caipNetwork.name
        }
      )

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

  private chooseFirstConnectionAndEmit() {
    const firstConnection = this.connections.find(c => {
      const hasAccounts = c.accounts.length > 0
      const hasConnector = this.connectors.some(connector =>
        HelpersUtil.isLowerCaseMatch(connector.id, c.connectorId)
      )

      return hasAccounts && hasConnector
    })

    if (firstConnection) {
      const [account] = firstConnection.accounts
      const connector = this.connectors.find(c =>
        HelpersUtil.isLowerCaseMatch(c.id, firstConnection.connectorId)
      )

      this.emit('accountChanged', {
        address: account?.address as string,
        chainId: Number(firstConnection.caipNetwork?.id ?? 1),
        connector
      })
    }
  }

  private providerHandlers: Record<
    string,
    {
      disconnect: () => void
      accountsChanged: (accounts: string[]) => void
      chainChanged: (chainId: string) => void
      provider: Provider | CombinedProvider
    } | null
  > = {}

  private listenProviderEvents(connectorId: string, provider: Provider | CombinedProvider) {
    // eslint-disable-next-line no-param-reassign
    connectorId = connectorId.toLowerCase()

    const disconnect = () => {
      this.removeProviderListeners(connectorId)
      this.deleteConnection(connectorId)

      if (HelpersUtil.isLowerCaseMatch(this.getConnectorId('eip155'), connectorId)) {
        this.chooseFirstConnectionAndEmit()
      }

      if (this.connections.length === 0) {
        this.emit('disconnect')
      }
    }

    const accountsChangedHandler = (accounts: string[]) => {
      if (accounts.length > 0) {
        const connection = this.connections.find(c =>
          HelpersUtil.isLowerCaseMatch(c.connectorId, connectorId)
        )

        if (!connection) {
          throw new Error('Connection not found')
        }

        const connector = this.connectors.find(c => HelpersUtil.isLowerCaseMatch(c.id, connectorId))

        if (!connector) {
          throw new Error('Connector not found')
        }

        if (HelpersUtil.isLowerCaseMatch(this.getConnectorId('eip155'), connectorId)) {
          this.emit('accountChanged', {
            address: accounts[0] as Address,
            chainId: Number(connection.caipNetwork?.id ?? 1),
            connector
          })
        }

        this.addConnection({
          connectorId,
          accounts: accounts.map(account => ({ address: account })),
          caipNetwork: connection?.caipNetwork
        })
      } else {
        disconnect()
      }
    }

    const chainChangedHandler = (chainId: string) => {
      const chainIdNumber =
        typeof chainId === 'string' ? EthersHelpersUtil.hexStringToNumber(chainId) : Number(chainId)

      const connection = this.connections.find(c =>
        HelpersUtil.isLowerCaseMatch(c.connectorId, connectorId)
      )

      const caipNetwork = this.getCaipNetworks().find(n => n.id === chainIdNumber)

      if (connection) {
        this.addConnection({
          connectorId,
          accounts: connection.accounts,
          caipNetwork
        })
      }

      if (HelpersUtil.isLowerCaseMatch(this.getConnectorId('eip155'), connectorId)) {
        this.emit('switchNetwork', { chainId: chainIdNumber })
      }
    }

    if (!this.providerHandlers[connectorId]) {
      provider.on('disconnect', disconnect)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('chainChanged', chainChangedHandler)

      this.providerHandlers[connectorId] = {
        provider,
        disconnect,
        accountsChanged: accountsChangedHandler,
        chainChanged: chainChangedHandler
      }
    }
  }

  private removeProviderListeners(connectorId: string) {
    if (this.providerHandlers[connectorId]) {
      const { provider, disconnect, accountsChanged, chainChanged } =
        this.providerHandlers[connectorId]

      provider.removeListener('disconnect', disconnect)
      provider.removeListener('accountsChanged', accountsChanged)
      provider.removeListener('chainChanged', chainChanged)

      this.providerHandlers[connectorId] = null
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
      const walletCapabilities = Ethers5Methods.parseWalletCapabilities(walletCapabilitiesString)
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
  ): Promise<Address> {
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
