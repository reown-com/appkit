import {
  type Config,
  type Connector,
  type CreateConfigParameters,
  type CreateConnectorFn,
  connect,
  createConfig,
  getAccount,
  getBalance,
  getConnections,
  injected,
  prepareTransactionRequest,
  reconnect,
  signMessage,
  switchChain,
  disconnect as wagmiDisconnect,
  estimateGas as wagmiEstimateGas,
  sendTransaction as wagmiSendTransaction,
  writeContract as wagmiWriteContract,
  waitForTransactionReceipt,
  watchAccount,
  watchConnections,
  watchConnectors,
  watchPendingTransactions
} from '@wagmi/core'
import { type Chain } from '@wagmi/core/chains'
import type UniversalProvider from '@walletconnect/universal-provider'
import {
  type Address,
  type Hex,
  UserRejectedRequestError as ViemUserRejectedRequestError,
  checksumAddress,
  formatUnits,
  parseUnits
} from 'viem'

import { AppKit, type AppKitOptions } from '@reown/appkit'
import { ErrorUtil, UserRejectedRequestError } from '@reown/appkit-common'
import type {
  AppKitNetwork,
  BaseNetwork,
  CaipNetwork,
  Connection,
  CustomRpcUrlMap
} from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil, NetworkUtil } from '@reown/appkit-common'
import {
  ChainController,
  CoreHelperUtil,
  OptionsController,
  StorageUtil
} from '@reown/appkit-controllers'
import { type ConnectorType, type Provider } from '@reown/appkit-controllers'
import { CaipNetworksUtil, HelpersUtil, PresetsUtil } from '@reown/appkit-utils'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import { WalletConnectConnector } from '@reown/appkit/connectors'

import { authConnector } from './connectors/AuthConnector.js'
import { walletConnect } from './connectors/WalletConnectConnector.js'
import { LimitterUtil } from './utils/LimitterUtil.js'
import { getCoinbaseConnector, getSafeConnector } from './utils/helpers.js'

interface PendingTransactionsFilter {
  enable: boolean
  pollingInterval?: number
}

// --- Constants ---------------------------------------------------- //
const DEFAULT_PENDING_TRANSACTIONS_FILTER = {
  enable: false,
  pollingInterval: 30_000
}

export class WagmiAdapter extends AdapterBlueprint {
  public wagmiChains: readonly [Chain, ...Chain[]] | undefined
  public wagmiConfig!: Config

  private pendingTransactionsFilter: PendingTransactionsFilter
  private unwatchPendingTransactions: (() => void) | undefined
  private balancePromises: Record<string, Promise<AdapterBlueprint.GetBalanceResult>> = {}

  constructor(
    configParams: Partial<CreateConfigParameters> & {
      networks: AppKitNetwork[]
      pendingTransactionsFilter?: PendingTransactionsFilter
      projectId: string
      customRpcUrls?: CustomRpcUrlMap
    }
  ) {
    const networks = CaipNetworksUtil.extendCaipNetworks(configParams.networks, {
      projectId: configParams.projectId,
      customNetworkImageUrls: {},
      customRpcUrls: configParams.customRpcUrls
    }) as [CaipNetwork, ...CaipNetwork[]]

    super()
    this.namespace = CommonConstantsUtil.CHAIN.EVM
    this.adapterType = CommonConstantsUtil.ADAPTER_TYPES.WAGMI
    this.projectId = configParams.projectId

    this.pendingTransactionsFilter = {
      ...DEFAULT_PENDING_TRANSACTIONS_FILTER,
      ...(configParams.pendingTransactionsFilter ?? {})
    }

    this.createConfig({ ...configParams, networks })
    this.checkChainId()
  }

  override construct(_options: AdapterBlueprint.Params) {
    this.checkChainId()
    this.setupWatchers()
  }

  override async getAccounts(
    params: AdapterBlueprint.GetAccountsParams
  ): Promise<AdapterBlueprint.GetAccountsResult> {
    const connector = this.getWagmiConnector(params.id)

    if (!connector) {
      return { accounts: [] }
    }

    if (connector.id === CommonConstantsUtil.CONNECTOR_ID.AUTH) {
      const provider = (await connector.getProvider()) as W3mFrameProvider | undefined
      if (!provider?.user) {
        return { accounts: [] }
      }

      const { address, accounts } = provider.user

      return Promise.resolve({
        accounts: (accounts || [{ address, type: 'eoa' }]).map(account =>
          CoreHelperUtil.createAccount('eip155', account.address, account.type)
        )
      })
    }

    const { addresses, address } = getAccount(this.wagmiConfig)

    return Promise.resolve({
      accounts: [...new Set(addresses || [address])]?.map(val =>
        CoreHelperUtil.createAccount('eip155', val || '', 'eoa')
      )
    })
  }

  private checkChainId() {
    const { chainId } = getAccount(this.wagmiConfig)

    if (chainId) {
      this.emit('switchNetwork', {
        chainId
      })
    }
  }

  private getWagmiConnector(id: string) {
    return this.wagmiConfig.connectors.find(c => c.id === id)
  }

  private createConfig(
    configParams: Partial<CreateConfigParameters> & {
      networks: CaipNetwork[]
      projectId: string
      customRpcUrls?: CustomRpcUrlMap
    }
  ) {
    this.wagmiChains = configParams.networks.filter(
      caipNetwork => caipNetwork.chainNamespace === CommonConstantsUtil.CHAIN.EVM
    ) as unknown as [BaseNetwork, ...BaseNetwork[]]

    const transports: CreateConfigParameters['transports'] = {}
    const connectors: CreateConnectorFn[] = [...(configParams.connectors ?? [])]

    this.wagmiChains.forEach(element => {
      const fromTransportProp = configParams.transports?.[element.id]
      const caipNetworkId = CaipNetworksUtil.getCaipNetworkId(element)

      if (fromTransportProp) {
        transports[element.id] = CaipNetworksUtil.extendWagmiTransports(
          element as CaipNetwork,
          configParams.projectId,
          fromTransportProp
        )
      } else {
        transports[element.id] = CaipNetworksUtil.getViemTransport(
          element as CaipNetwork,
          configParams.projectId,
          configParams.customRpcUrls?.[caipNetworkId]
        )
      }
    })

    this.wagmiConfig = createConfig({
      ...configParams,
      chains: this.wagmiChains,
      connectors,
      transports
    } as CreateConfigParameters)
  }

  private setupWatchPendingTransactions() {
    if (!this.pendingTransactionsFilter.enable || this.unwatchPendingTransactions) {
      return
    }

    this.unwatchPendingTransactions = watchPendingTransactions(this.wagmiConfig, {
      pollingInterval: this.pendingTransactionsFilter.pollingInterval,
      /* Magic RPC does not support the pending transactions. We handle transaction for the AuthConnector cases in AppKit client to handle all clients at once. Adding the onError handler to avoid the error to throw. */
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onError: () => {},
      onTransactions: () => {
        this.emit('pendingTransactions')
        LimitterUtil.increase('pendingTransactions')
      }
    })

    const unsubscribe = LimitterUtil.subscribeKey('pendingTransactions', val => {
      if (val >= CommonConstantsUtil.LIMITS.PENDING_TRANSACTIONS) {
        this.unwatchPendingTransactions?.()
        unsubscribe()
      }
    })
  }

  private setupWatchers() {
    watchConnections(this.wagmiConfig, {
      onChange: connections => {
        this.clearConnections()
        this.addConnection(
          ...connections.map(connection => {
            const caipNetwork = this.getCaipNetworks().find(
              network => network.id === connection.chainId
            )

            const isAuth = connection.connector.id === CommonConstantsUtil.CONNECTOR_ID.AUTH

            return {
              accounts: connection.accounts.map(account => ({
                address: this.toChecksummedAddress(account)
              })),
              caipNetwork,
              connectorId: connection.connector.id,
              auth: isAuth
                ? {
                    name: StorageUtil.getConnectedSocialProvider(),
                    username: StorageUtil.getConnectedSocialUsername()
                  }
                : undefined
            }
          })
        )
      }
    })
    watchAccount(this.wagmiConfig, {
      onChange: (accountData, prevAccountData) => {
        if (accountData.status === 'disconnected' && prevAccountData.address) {
          this.emit('disconnect')
        }

        if (accountData?.chainId && accountData?.chainId !== prevAccountData?.chainId) {
          this.emit('switchNetwork', {
            chainId: accountData.chainId
          })
        }

        if (accountData.status === 'connected') {
          const hasAccountChanged = accountData.address !== prevAccountData?.address
          const hasConnectorChanged = accountData.connector.id !== prevAccountData.connector?.id
          const hasConnectionStatusChanged = prevAccountData.status !== 'connected'

          if (hasAccountChanged || hasConnectorChanged || hasConnectionStatusChanged) {
            this.setupWatchPendingTransactions()

            this.handleAccountChanged({
              address: accountData.address,
              chainId: accountData.chainId,
              connector: accountData.connector
            })
          }
        }
      }
    })
  }

  private async addThirdPartyConnectors(options: AppKitOptions) {
    const thirdPartyConnectors: CreateConnectorFn[] = []

    if (options.enableCoinbase !== false) {
      const coinbaseConnector = await getCoinbaseConnector(this.wagmiConfig.connectors)
      if (coinbaseConnector) {
        thirdPartyConnectors.push(coinbaseConnector)
      }
    }

    const safeConnector = await getSafeConnector(this.wagmiConfig.connectors)
    if (safeConnector) {
      thirdPartyConnectors.push(safeConnector)
    }

    await Promise.all(
      thirdPartyConnectors.map(connector => {
        const cnctr = this.wagmiConfig._internal.connectors.setup(connector)
        this.wagmiConfig._internal.connectors.setState(prev => [...prev, cnctr])

        return this.addWagmiConnector(cnctr, options)
      })
    )
  }

  private addWagmiConnectors(options: AppKitOptions, appKit: AppKit) {
    const customConnectors: CreateConnectorFn[] = []

    customConnectors.push(walletConnect(options, appKit))

    if (options.enableInjected !== false) {
      customConnectors.push(injected({ shimDisconnect: true }))
    }

    const isEmailEnabled = appKit?.remoteFeatures?.email ?? appKit?.features?.email ?? true
    const socials = appKit?.remoteFeatures?.socials ?? appKit?.features?.socials
    const socialsEnabled = Array.isArray(socials) && socials?.length > 0

    if (isEmailEnabled || socialsEnabled) {
      customConnectors.push(
        authConnector({
          chains: this.wagmiChains,
          options: { projectId: options.projectId, enableAuthLogger: options.enableAuthLogger }
        })
      )
    }

    customConnectors.forEach(connector => {
      const cnctr = this.wagmiConfig._internal.connectors.setup(connector)
      this.wagmiConfig._internal.connectors.setState(prev => [...prev, cnctr])
    })
  }

  private async handleAccountChanged({
    address,
    chainId,
    connector
  }: {
    address: string
    chainId: number | string
    connector: Connector
  }) {
    if (!this.namespace) {
      throw new Error('WagmiAdapter:handleAccountChanged - namespace is required')
    }

    const provider = (await connector.getProvider().catch(() => undefined)) as Provider | undefined

    this.emit('accountChanged', {
      address: this.toChecksummedAddress(address),
      chainId,
      connector: {
        id: connector.id,
        name: PresetsUtil.ConnectorNamesMap[connector.id] ?? connector.name,
        imageId: PresetsUtil.ConnectorImageIds[connector.id],
        type: PresetsUtil.ConnectorTypesMap[connector.type] ?? 'EXTERNAL',
        info:
          connector.id === CommonConstantsUtil.CONNECTOR_ID.INJECTED
            ? undefined
            : { rdns: connector.id },
        provider,
        chain: this.namespace,
        chains: []
      }
    })
  }

  public async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    try {
      const signature = await signMessage(this.wagmiConfig, {
        message: params.message,
        account: params.address as Hex
      })

      return { signature }
    } catch (error) {
      throw new Error('WagmiAdapter:signMessage - Sign message failed')
    }
  }

  public async sendTransaction(
    params: AdapterBlueprint.SendTransactionParams
  ): Promise<AdapterBlueprint.SendTransactionResult> {
    const { chainId, address } = getAccount(this.wagmiConfig)
    const txParams = {
      account: address,
      to: params.to as Hex,
      value: Number.isNaN(Number(params.value)) ? BigInt(0) : BigInt(params.value),
      gas: params.gas ? BigInt(params.gas) : undefined,
      gasPrice: params.gasPrice ? BigInt(params.gasPrice) : undefined,
      data: params.data as Hex,
      chainId,
      type: 'legacy' as const,
      parameters: ['nonce'] as const
    }

    await prepareTransactionRequest(this.wagmiConfig, txParams)
    const tx = await wagmiSendTransaction(this.wagmiConfig, txParams)
    await waitForTransactionReceipt(this.wagmiConfig, { hash: tx, timeout: 25000 })

    return { hash: tx }
  }

  public async writeContract(
    params: AdapterBlueprint.WriteContractParams
  ): Promise<AdapterBlueprint.WriteContractResult> {
    const { caipNetwork, ...data } = params
    const chainId = Number(NetworkUtil.caipNetworkIdToNumber(caipNetwork.caipNetworkId))

    const tx = await wagmiWriteContract(this.wagmiConfig, {
      chain: this.wagmiChains?.[chainId],
      chainId,
      address: data.tokenAddress,
      account: data.fromAddress,
      abi: data.abi,
      functionName: data.method,
      args: data.args,
      __mode: 'prepared'
    })

    return { hash: tx }
  }

  public async estimateGas(
    params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    try {
      const result = await wagmiEstimateGas(this.wagmiConfig, {
        account: params.address as Hex,
        to: params.to as Hex,
        data: params.data as Hex,
        type: 'legacy'
      })

      return { gas: result }
    } catch (error) {
      throw new Error('WagmiAdapter:estimateGas - error estimating gas')
    }
  }

  public parseUnits(params: AdapterBlueprint.ParseUnitsParams): AdapterBlueprint.ParseUnitsResult {
    return parseUnits(params.value, params.decimals)
  }

  public formatUnits(
    params: AdapterBlueprint.FormatUnitsParams
  ): AdapterBlueprint.FormatUnitsResult {
    return formatUnits(params.value, params.decimals)
  }

  private async addWagmiConnector(connector: Connector, options: AppKitOptions) {
    if (!this.namespace) {
      throw new Error('WagmiAdapter:addWagmiConnector - namespace is required')
    }

    /*
     * We don't need to set auth connector or walletConnect connector
     * from wagmi since we already set it in chain adapter blueprint
     */

    if (
      connector.type === CommonConstantsUtil.CONNECTOR_ID.INJECTED &&
      options.enableEIP6963 === false
    ) {
      return
    }

    if (
      connector.id === CommonConstantsUtil.CONNECTOR_ID.AUTH ||
      connector.id === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    ) {
      return
    }

    const provider = (await connector.getProvider().catch(() => undefined)) as Provider | undefined

    this.addConnector({
      id: connector.id,
      explorerId: PresetsUtil.ConnectorExplorerIds[connector.id],
      imageUrl: options?.connectorImages?.[connector.id] ?? connector.icon,
      name: PresetsUtil.ConnectorNamesMap[connector.id] ?? connector.name,
      imageId: PresetsUtil.ConnectorImageIds[connector.id],
      type: PresetsUtil.ConnectorTypesMap[connector.type] ?? 'EXTERNAL',
      info:
        connector.id === CommonConstantsUtil.CONNECTOR_ID.INJECTED
          ? undefined
          : { rdns: connector.id },
      provider,
      chain: this.namespace,
      chains: []
    })
  }

  public async syncConnectors(options: AppKitOptions, appKit: AppKit) {
    /*
     * Watch for new connectors. This is needed because some EIP6963
     * connectors are added later in the process the initial setup
     */
    watchConnectors(this.wagmiConfig, {
      onChange: connectors => {
        connectors.forEach(connector => this.addWagmiConnector(connector, options))
      }
    })

    // Add custom connectors (WalletConnect and Auth)
    this.addWagmiConnectors(options, appKit)

    // Add Wagmi's initial connectors (Extensions)
    await Promise.all(
      this.wagmiConfig.connectors.map(connector => this.addWagmiConnector(connector, options))
    )

    // Add third party connectors (Coinbase, Safe, etc.)
    this.addThirdPartyConnectors(options)
  }

  // Wagmi already handles connections
  public async syncConnections() {
    return Promise.resolve()
  }

  public async syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const { id, chainId } = params
    const connections = getConnections(this.wagmiConfig)
    const connection = connections.find(c => c.connector.id === id)
    const connector = this.getWagmiConnector(id)
    const provider = (await connector?.getProvider()) as Provider

    const isSafeApp = CoreHelperUtil.isSafeApp()

    if (isSafeApp && id === CommonConstantsUtil.CONNECTOR_ID.SAFE && !connection?.accounts.length) {
      const safeAppConnector = this.getWagmiConnector('safe')
      if (safeAppConnector) {
        const res = await connect(this.wagmiConfig, {
          connector: safeAppConnector,
          chainId: Number(chainId)
        })

        const safeProvider = (await safeAppConnector.getProvider()) as Provider

        return {
          chainId: Number(chainId),
          address: this.toChecksummedAddress(res.accounts[0] as string),
          provider: safeProvider,
          type: connection?.connector.type?.toUpperCase() as ConnectorType,
          id: connection?.connector.id as string
        }
      }
    }

    return {
      chainId: Number(connection?.chainId),
      address: this.toChecksummedAddress(connection?.accounts[0] as string),
      provider,
      type: connection?.connector.type?.toUpperCase() as ConnectorType,
      id: connection?.connector.id as string
    }
  }

  public override async connectWalletConnect(chainId?: number | string) {
    try {
      // Attempt one click auth first, if authenticated, still connect with wagmi to store the session
      const walletConnectConnector = this.getWalletConnectConnector()
      await walletConnectConnector.authenticate()

      const wagmiConnector = this.getWagmiConnector('walletConnect')

      if (!wagmiConnector) {
        throw new Error('UniversalAdapter:connectWalletConnect - connector not found')
      }

      const res = await connect(this.wagmiConfig, {
        connector: wagmiConnector,
        chainId: chainId ? Number(chainId) : undefined
      })

      if (res.chainId !== Number(chainId)) {
        await switchChain(this.wagmiConfig, { chainId: res.chainId })
      }

      return { clientId: await walletConnectConnector.provider.client.core.crypto.getClientId() }
    } catch (err) {
      if (err instanceof ViemUserRejectedRequestError) {
        throw new UserRejectedRequestError(err)
      }

      if (ErrorUtil.isUserRejectedRequestError(err)) {
        throw new UserRejectedRequestError(err)
      }

      throw err
    }
  }

  public async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    try {
      const { id, address, provider, type, info, chainId, socialUri } = params
      const connector = this.getWagmiConnector(id)

      if (!connector) {
        throw new Error('connectionControllerClient:connectExternal - connector is undefined')
      }

      if (provider && info && connector.id === CommonConstantsUtil.CONNECTOR_ID.EIP6963) {
        // @ts-expect-error Exists on EIP6963Connector
        connector.setEip6963Wallet?.({ provider, info })
      }

      const connection = this.wagmiConfig.state?.connections?.get(connector.uid)

      if (connection) {
        await this.wagmiConfig.storage?.setItem('recentConnectorId', connector.id)

        const sortedAccounts = [...connection.accounts].sort((a, b) => {
          if (HelpersUtil.isLowerCaseMatch(a, address)) {
            return -1
          }

          if (HelpersUtil.isLowerCaseMatch(b, address)) {
            return 1
          }

          return 0
        }) as [Address, ...Address[]]

        this.wagmiConfig?.setState(x => ({
          ...x,
          connections: new Map(x.connections).set(connector.uid, {
            accounts: sortedAccounts,
            chainId: connection.chainId,
            connector: connection.connector
          }),
          current: connector.uid,
          status: 'connected'
        }))

        return {
          address: this.toChecksummedAddress(sortedAccounts[0]),
          chainId: connection.chainId,
          provider: provider as Provider,
          type: type as ConnectorType,
          id
        }
      }

      const res = await connect(this.wagmiConfig, {
        connector,
        chainId: chainId ? Number(chainId) : undefined,
        // @ts-expect-error socialUri is needed for auth connector but not in wagmi types
        socialUri
      })

      return {
        address: this.toChecksummedAddress(res.accounts[0]),
        chainId: res.chainId,
        provider: provider as Provider,
        type: type as ConnectorType,
        id
      }
    } catch (err) {
      if (err instanceof ViemUserRejectedRequestError) {
        throw new UserRejectedRequestError(err)
      }

      if (ErrorUtil.isUserRejectedRequestError(err)) {
        throw new UserRejectedRequestError(err)
      }

      throw err
    }
  }

  public override get connections(): Connection[] {
    return Array.from(this.wagmiConfig.state.connections.values()).map(connection => ({
      accounts: connection.accounts.map(account => ({
        address: this.toChecksummedAddress(account)
      })),
      connectorId: connection.connector.id
    }))
  }

  public override async reconnect(params: AdapterBlueprint.ConnectParams): Promise<void> {
    const { id } = params

    const connector = this.getWagmiConnector(id)

    if (!connector) {
      throw new Error('connectionControllerClient:connectExternal - connector is undefined')
    }

    await reconnect(this.wagmiConfig, {
      connectors: [connector]
    })
  }

  public async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const address = params.address
    const caipNetwork = this.getCaipNetworks().find(network => network.id === params.chainId)

    if (!address) {
      return Promise.resolve({ balance: '0.00', symbol: 'ETH' })
    }

    if (caipNetwork && this.wagmiConfig) {
      const caipAddress = `${caipNetwork.caipNetworkId}:${params.address}`
      const cachedPromise = this.balancePromises[caipAddress]
      if (cachedPromise) {
        return cachedPromise
      }

      const cachedBalance = StorageUtil.getNativeBalanceCacheForCaipAddress(caipAddress)
      if (cachedBalance) {
        return { balance: cachedBalance.balance, symbol: cachedBalance.symbol }
      }

      this.balancePromises[caipAddress] = new Promise<AdapterBlueprint.GetBalanceResult>(
        async resolve => {
          try {
            const chainId = Number(params.chainId)
            const balance = await getBalance(this.wagmiConfig, {
              address: params.address as Hex,
              chainId,
              token: params.tokens?.[caipNetwork.caipNetworkId]?.address as Hex
            })

            StorageUtil.updateNativeBalanceCache({
              caipAddress,
              balance: balance.formatted,
              symbol: balance.symbol,
              timestamp: Date.now()
            })
            resolve({ balance: balance.formatted, symbol: balance.symbol })
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('Appkit:WagmiAdapter:getBalance - Error getting balance', error)
            resolve({ balance: '0.00', symbol: 'ETH' })
          }
        }
      ).finally(() => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.balancePromises[caipAddress]
      })

      return this.balancePromises[caipAddress] || { balance: '0.00', symbol: 'ETH' }
    }

    return { balance: '', symbol: '' }
  }

  public getWalletConnectProvider(): AdapterBlueprint.GetWalletConnectProviderResult {
    return this.getWagmiConnector('walletConnect')?.['provider'] as UniversalProvider
  }

  public async disconnect(params: AdapterBlueprint.DisconnectParams) {
    if (params.id) {
      const connector = this.getWagmiConnector(params.id)

      const connections = getConnections(this.wagmiConfig)
      const connection = connections.find(c =>
        HelpersUtil.isLowerCaseMatch(c.connector.id, params.id)
      )

      await wagmiDisconnect(this.wagmiConfig, { connector })
      if (OptionsController.state.enableReconnect === false) {
        this.deleteConnection(params.id)
      }

      if (connection) {
        return {
          connections: [
            {
              accounts: connection.accounts.map(account => ({
                address: this.toChecksummedAddress(account)
              })),
              connectorId: connection.connector.id
            }
          ]
        }
      }

      return { connections: [] }
    }

    return this.disconnectAll()
  }

  private async disconnectAll() {
    const wagmiConnections = getConnections(this.wagmiConfig)

    const connections = await Promise.allSettled(
      wagmiConnections.map(async connection => {
        const connector = this.getWagmiConnector(connection.connector.id)

        if (connector) {
          await wagmiDisconnect(this.wagmiConfig, { connector })
        }

        return connection
      })
    )

    // Ensure the connections are cleared
    this.wagmiConfig.state.connections.clear()

    return {
      connections: connections
        .filter(connection => connection.status === 'fulfilled')
        .map(({ value: connection }) => ({
          accounts: connection.accounts.map(account => ({
            address: this.toChecksummedAddress(account)
          })),
          connectorId: connection.connector.id
        }))
    }
  }

  public override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams) {
    const { caipNetwork } = params

    const wagmiChain = this.wagmiConfig.chains.find(
      chain => chain.id.toString() === caipNetwork.id.toString()
    )

    await switchChain(this.wagmiConfig, {
      chainId: caipNetwork.id as number,
      addEthereumChainParameter: {
        chainName: wagmiChain?.name ?? caipNetwork.name,
        nativeCurrency: wagmiChain?.nativeCurrency ?? caipNetwork.nativeCurrency,
        rpcUrls: [
          caipNetwork.rpcUrls?.['chainDefault']?.http?.[0] ??
            wagmiChain?.rpcUrls?.default?.http?.[0] ??
            ''
        ],
        blockExplorerUrls: [
          wagmiChain?.blockExplorers?.default?.url ?? caipNetwork.blockExplorers?.default?.url ?? ''
        ]
      }
    })

    await super.switchNetwork(params)
  }

  public async getCapabilities(params: string) {
    if (!this.wagmiConfig) {
      throw new Error('connectionControllerClient:getCapabilities - wagmiConfig is undefined')
    }

    const connections = getConnections(this.wagmiConfig)
    const connection = connections[0]

    const connector = connection ? this.getWagmiConnector(connection.connector.id) : null

    if (!connector) {
      throw new Error('connectionControllerClient:getCapabilities - connector is undefined')
    }

    const provider = (await connector.getProvider()) as UniversalProvider

    if (!provider) {
      throw new Error('connectionControllerClient:getCapabilities - provider is undefined')
    }

    return await provider.request({ method: 'wallet_getCapabilities', params: [params] })
  }

  public async grantPermissions(params: AdapterBlueprint.GrantPermissionsParams) {
    if (!this.wagmiConfig) {
      throw new Error('connectionControllerClient:grantPermissions - wagmiConfig is undefined')
    }

    const connections = getConnections(this.wagmiConfig)
    const connection = connections[0]

    const connector = connection ? this.getWagmiConnector(connection.connector.id) : null

    if (!connector) {
      throw new Error('connectionControllerClient:grantPermissions - connector is undefined')
    }

    const provider = (await connector.getProvider()) as UniversalProvider

    if (!provider) {
      throw new Error('connectionControllerClient:grantPermissions - provider is undefined')
    }

    return provider.request({ method: 'wallet_grantPermissions', params })
  }

  public async revokePermissions(
    params: AdapterBlueprint.RevokePermissionsParams
  ): Promise<`0x${string}`> {
    if (!this.wagmiConfig) {
      throw new Error('connectionControllerClient:revokePermissions - wagmiConfig is undefined')
    }

    const connections = getConnections(this.wagmiConfig)
    const connection = connections[0]

    const connector = connection ? this.getWagmiConnector(connection.connector.id) : null

    if (!connector) {
      throw new Error('connectionControllerClient:revokePermissions - connector is undefined')
    }

    const provider = (await connector.getProvider()) as UniversalProvider

    if (!provider) {
      throw new Error('connectionControllerClient:revokePermissions - provider is undefined')
    }

    return provider.request({ method: 'wallet_revokePermissions', params })
  }

  public async walletGetAssets(
    params: AdapterBlueprint.WalletGetAssetsParams
  ): Promise<AdapterBlueprint.WalletGetAssetsResponse> {
    if (!this.wagmiConfig) {
      throw new Error('connectionControllerClient:walletGetAssets - wagmiConfig is undefined')
    }

    const connections = getConnections(this.wagmiConfig)
    const connection = connections[0]

    const connector = connection ? this.getWagmiConnector(connection.connector.id) : null

    if (!connector) {
      throw new Error('connectionControllerClient:walletGetAssets - connector is undefined')
    }

    const provider = (await connector.getProvider()) as UniversalProvider

    if (!provider) {
      throw new Error('connectionControllerClient:walletGetAssets - provider is undefined')
    }

    return provider.request({ method: 'wallet_getAssets', params: [params] })
  }

  public override setAuthProvider(authProvider: W3mFrameProvider) {
    if (!this.namespace) {
      throw new Error('WagmiAdapter:setAuthProvider - namespace is required')
    }

    this.addConnector({
      id: CommonConstantsUtil.CONNECTOR_ID.AUTH,
      type: 'AUTH',
      name: CommonConstantsUtil.CONNECTOR_NAMES.AUTH,
      provider: authProvider,
      imageId: PresetsUtil.ConnectorImageIds[CommonConstantsUtil.CONNECTOR_ID.AUTH],
      chain: this.namespace,
      chains: []
    })
  }

  public override async setUniversalProvider(universalProvider: UniversalProvider): Promise<void> {
    universalProvider.on('connect', () => {
      const connections = getConnections(this.wagmiConfig)
      const connector = this.getWagmiConnector('walletConnect')
      if (connector && !connections.find(c => c.connector.id === connector.id)) {
        /**
         * Handles reconnection logic for Wagmi in multi-chain environments.
         *
         * Context:
         * - When connected to other namespaces, Wagmi requires a reconnect to properly bind to EVM chains.
         *
         * Issue with SIWX + One-Click Authentication:
         * - If Sign-In with X (SIWX) is enabled and the wallet supports One-Click Authentication, reconnection causes issues:
         *   1. The SIWX `authenticate()` method may still be pending.
         *   2. A reconnect triggers an `accountChanged` event in Wagmi.
         *   3. This event re-triggers the SIWX Sign Message UI unnecessarily.
         *
         * Resolution:
         * - To prevent this, we check if the current active chain is `'eip155'`.
         * - If it is, we skip reconnection to avoid interrupting in the SIWX flow.
         */
        if (ChainController.state.activeChain === 'eip155') {
          return
        }

        reconnect(this.wagmiConfig, {
          connectors: [connector]
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

    return Promise.resolve()
  }

  private toChecksummedAddress(address: string) {
    return checksumAddress(address.toLowerCase() as `0x${string}`)
  }
}
