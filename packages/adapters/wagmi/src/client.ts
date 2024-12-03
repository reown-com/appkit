import type UniversalProvider from '@walletconnect/universal-provider'
import type { AppKitNetwork, BaseNetwork, CaipNetwork } from '@reown/appkit-common'
import { AdapterBlueprint } from '@reown/appkit/adapters'
import { CoreHelperUtil } from '@reown/appkit-core'
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
  watchConnections,
  getBalance,
  getEnsName,
  getEnsAvatar,
  signMessage,
  estimateGas as wagmiEstimateGas,
  sendTransaction as wagmiSendTransaction,
  getEnsAddress as wagmiGetEnsAddress,
  writeContract as wagmiWriteContract,
  waitForTransactionReceipt,
  getAccount,
  prepareTransactionRequest,
  reconnect
} from '@wagmi/core'
import { type Chain } from '@wagmi/core/chains'

import {
  ConstantsUtil as CommonConstantsUtil,
  isReownName,
  NetworkUtil
} from '@reown/appkit-common'
import { authConnector } from './connectors/AuthConnector.js'
import { AppKit, WcHelpersUtil, type AppKitOptions } from '@reown/appkit'
import { walletConnect } from './connectors/UniversalConnector.js'
import { coinbaseWallet } from '@wagmi/connectors'
import {
  ConstantsUtil as CoreConstantsUtil,
  type ConnectorType,
  type Provider
} from '@reown/appkit-core'
import { CaipNetworksUtil, ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import {
  formatUnits,
  parseUnits,
  type GetEnsAddressReturnType,
  type Hex,
  type HttpTransport
} from 'viem'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { normalize } from 'viem/ens'
import { parseWalletCapabilities } from './utils/helpers.js'

export class WagmiAdapter extends AdapterBlueprint {
  public wagmiChains: readonly [Chain, ...Chain[]] | undefined
  public wagmiConfig!: Config
  public adapterType = 'wagmi'

  constructor(
    configParams: Partial<CreateConfigParameters> & {
      networks: AppKitNetwork[]
      projectId: string
    }
  ) {
    super({
      projectId: configParams.projectId,
      networks: CaipNetworksUtil.extendCaipNetworks(configParams.networks, {
        projectId: configParams.projectId,
        customNetworkImageUrls: {}
      }) as [CaipNetwork, ...CaipNetwork[]]
    })
    this.namespace = CommonConstantsUtil.CHAIN.EVM
    this.createConfig({
      ...configParams,
      networks: CaipNetworksUtil.extendCaipNetworks(configParams.networks, {
        projectId: configParams.projectId,
        customNetworkImageUrls: {}
      }) as [CaipNetwork, ...CaipNetwork[]],
      projectId: configParams.projectId
    })
    this.setupWatchers()
  }

  override async getAccounts(
    params: AdapterBlueprint.GetAccountsParams
  ): Promise<AdapterBlueprint.GetAccountsResult> {
    const connector = this.wagmiConfig.connectors.find(c => c.id === params.id)
    if (!connector) {
      throw new Error('WagmiAdapter:getAccounts - connector is undefined')
    }

    if (connector.id === ConstantsUtil.AUTH_CONNECTOR_ID) {
      const provider = connector['provider'] as W3mFrameProvider
      const { address, accounts } = await provider.connect()

      return Promise.resolve({
        accounts: (accounts || [{ address, type: 'eoa' }]).map(account =>
          CoreHelperUtil.createAccount('eip155', account.address, account.type)
        )
      })
    }

    const { addresses, address } = getAccount(this.wagmiConfig)

    return Promise.resolve({
      accounts: (addresses || [address])?.map(val =>
        CoreHelperUtil.createAccount('eip155', val || '', 'eoa')
      )
    })
  }

  private createConfig(
    configParams: Partial<CreateConfigParameters> & {
      networks: CaipNetwork[]
      projectId: string
    }
  ) {
    this.caipNetworks = CaipNetworksUtil.extendCaipNetworks(configParams.networks, {
      projectId: configParams.projectId,
      customNetworkImageUrls: {}
    }) as [CaipNetwork, ...CaipNetwork[]]

    this.wagmiChains = this.caipNetworks.filter(
      caipNetwork => caipNetwork.chainNamespace === CommonConstantsUtil.CHAIN.EVM
    ) as unknown as [BaseNetwork, ...BaseNetwork[]]

    const transportsArr = this.wagmiChains.map(chain => [
      chain.id,
      CaipNetworksUtil.getViemTransport(chain as CaipNetwork)
    ])

    Object.entries(configParams.transports ?? {}).forEach(([chainId, transport]) => {
      const index = transportsArr.findIndex(([id]) => id === Number(chainId))
      if (index === -1) {
        transportsArr.push([Number(chainId), transport as HttpTransport])
      } else {
        transportsArr[index] = [Number(chainId), transport as HttpTransport]
      }
    })

    const transports = Object.fromEntries(transportsArr)
    const connectors: CreateConnectorFn[] = [...(configParams.connectors ?? [])]

    this.wagmiConfig = createConfig({
      ...configParams,
      chains: this.wagmiChains,
      transports,
      connectors
    })
  }

  private setupWatchers() {
    watchAccount(this.wagmiConfig, {
      onChange: accountData => {
        if (accountData.address) {
          this.emit('accountChanged', {
            address: accountData.address,
            chainId: accountData.chainId
          })
        }
        if (accountData.chainId) {
          this.emit('switchNetwork', {
            address: accountData.address,
            chainId: accountData.chainId
          })
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

  private addWagmiConnectors(options: AppKitOptions, appKit: AppKit) {
    const customConnectors: CreateConnectorFn[] = []

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

    if (options.enableWalletConnect !== false) {
      customConnectors.push(
        walletConnect(options, appKit, this.caipNetworks as [CaipNetwork, ...CaipNetwork[]])
      )
    }

    if (options.enableInjected !== false) {
      customConnectors.push(injected({ shimDisconnect: true }))
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
          options: { projectId: options.projectId },
          provider: this.availableConnectors.find(c => c.id === ConstantsUtil.AUTH_CONNECTOR_ID)
            ?.provider as W3mFrameProvider
        })
      )
    }

    customConnectors.forEach(connector => {
      const cnctr = this.wagmiConfig._internal.connectors.setup(connector)
      this.wagmiConfig._internal.connectors.setState(prev => [...prev, cnctr])
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
    const { chainId } = getAccount(this.wagmiConfig)
    const txParams = {
      account: params.address,
      to: params.to as Hex,
      value: params.value as bigint,
      gas: params.gas as bigint,
      gasPrice: params.gasPrice as bigint,
      data: params.data as Hex,
      chainId,
      type: 'legacy' as const
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
      address: data.tokenAddress as Hex,
      account: data.fromAddress as Hex,
      abi: data.abi,
      functionName: data.method,
      args: [data.receiverAddress, data.tokenAmount]
    })

    return { hash: tx }
  }

  public async getEnsAddress(
    params: AdapterBlueprint.GetEnsAddressParams
  ): Promise<AdapterBlueprint.GetEnsAddressResult> {
    const { name, caipNetwork } = params

    try {
      if (!this.wagmiConfig) {
        throw new Error(
          'networkControllerClient:getApprovedCaipNetworksData - wagmiConfig is undefined'
        )
      }

      let ensName: boolean | GetEnsAddressReturnType = false
      let wcName: boolean | string = false
      if (isReownName(name)) {
        wcName = (await WcHelpersUtil.resolveReownName(name)) || false
      }
      if (caipNetwork.id === 1) {
        ensName = await wagmiGetEnsAddress(this.wagmiConfig, {
          name: normalize(name),
          chainId: caipNetwork.id
        })
      }

      return { address: (ensName as string) || (wcName as string) || false }
    } catch {
      return { address: false }
    }
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

  public syncConnectors(options: AppKitOptions, appKit: AppKit) {
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

    filteredConnectors.forEach(connector => {
      const shouldSkip = ConstantsUtil.AUTH_CONNECTOR_ID === connector.id

      const injectedConnector = connector.id === ConstantsUtil.INJECTED_CONNECTOR_ID

      if (!shouldSkip && this.namespace) {
        this.addConnector({
          id: connector.id,
          explorerId: PresetsUtil.ConnectorExplorerIds[connector.id],
          imageUrl: options?.connectorImages?.[connector.id] ?? connector.icon,
          name: PresetsUtil.ConnectorNamesMap[connector.id] ?? connector.name,
          imageId: PresetsUtil.ConnectorImageIds[connector.id],
          type: PresetsUtil.ConnectorTypesMap[connector.type] ?? 'EXTERNAL',
          info: injectedConnector ? undefined : { rdns: connector.id },
          chain: this.namespace,
          chains: []
        })
      }
    })
  }

  public async syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const { id } = params
    const connections = getConnections(this.wagmiConfig)
    const connection = connections.find(c => c.connector.id === id)
    const connector = this.wagmiConfig.connectors.find(c => c.id === id)
    const provider = (await connector?.getProvider()) as Provider

    return {
      chainId: Number(connection?.chainId),
      address: connection?.accounts[0] as string,
      provider,
      type: connection?.connector.type as ConnectorType,
      id: connection?.connector.id as string
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

  public async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const { id, provider, type, info, chainId } = params

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

    return {
      address: res.accounts[0],
      chainId: res.chainId,
      provider: provider as Provider,
      type: type as ConnectorType,
      id
    }
  }

  public override async reconnect(params: AdapterBlueprint.ConnectParams): Promise<void> {
    const { id } = params

    const connector = this.wagmiConfig.connectors.find(c => c.id === id)
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
    const caipNetwork = this.caipNetworks?.find(network => network.id === params.chainId)

    if (caipNetwork && this.wagmiConfig) {
      const chainId = Number(params.chainId)
      const balance = await getBalance(this.wagmiConfig, {
        address: params.address as Hex,
        chainId,
        token: params.tokens?.[caipNetwork.caipNetworkId]?.address as Hex
      })

      return { balance: balance.formatted, symbol: balance.symbol }
    }

    return { balance: '', symbol: '' }
  }

  public async getProfile(
    params: AdapterBlueprint.GetProfileParams
  ): Promise<AdapterBlueprint.GetProfileResult> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const chainId = params.chainId as number
    const profileName = await getEnsName(this.wagmiConfig, {
      address: params.address as Hex,
      chainId
    })
    if (profileName) {
      const profileImage = await getEnsAvatar(this.wagmiConfig, {
        name: profileName,
        chainId
      })

      return { profileName, profileImage: profileImage ?? undefined }
    }

    return { profileName: undefined, profileImage: undefined }
  }

  public getWalletConnectProvider(): AdapterBlueprint.GetWalletConnectProviderResult {
    return this.wagmiConfig.connectors.find(c => c.type === 'walletConnect')?.[
      'provider'
    ] as UniversalProvider
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
  }

  public async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams) {
    await switchChain(this.wagmiConfig, { chainId: params.caipNetwork.id as number })
  }

  public async getCapabilities(params: string) {
    if (!this.wagmiConfig) {
      throw new Error('connectionControllerClient:getCapabilities - wagmiConfig is undefined')
    }

    const connections = getConnections(this.wagmiConfig)
    const connection = connections[0]

    if (!connection?.connector) {
      throw new Error('connectionControllerClient:getCapabilities - connector is undefined')
    }

    const provider = (await connection.connector.getProvider()) as UniversalProvider

    if (!provider) {
      throw new Error('connectionControllerClient:getCapabilities - provider is undefined')
    }

    const walletCapabilitiesString = provider.session?.sessionProperties?.['capabilities']
    if (walletCapabilitiesString) {
      const walletCapabilities = parseWalletCapabilities(walletCapabilitiesString)
      const accountCapabilities = walletCapabilities[params]
      if (accountCapabilities) {
        return accountCapabilities
      }
    }

    return await provider.request({ method: 'wallet_getCapabilities', params: [params] })
  }

  public async grantPermissions(params: AdapterBlueprint.GrantPermissionsParams) {
    if (!this.wagmiConfig) {
      throw new Error('connectionControllerClient:grantPermissions - wagmiConfig is undefined')
    }

    const connections = getConnections(this.wagmiConfig)
    const connection = connections[0]

    if (!connection?.connector) {
      throw new Error('connectionControllerClient:grantPermissions - connector is undefined')
    }

    const provider = (await connection.connector.getProvider()) as UniversalProvider

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

    if (!connection?.connector) {
      throw new Error('connectionControllerClient:revokePermissions - connector is undefined')
    }

    const provider = (await connection.connector.getProvider()) as UniversalProvider

    if (!provider) {
      throw new Error('connectionControllerClient:revokePermissions - provider is undefined')
    }

    return provider.request({ method: 'wallet_revokePermissions', params })
  }
}
