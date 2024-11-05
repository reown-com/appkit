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
  prepareTransactionRequest
} from '@wagmi/core'
import { type Chain } from '@wagmi/core/chains'
import { convertToAppKitChains, getTransport } from './utils/helpers.js'
import {
  ConstantsUtil as CommonConstantsUtil,
  isReownName,
  NetworkUtil
} from '@reown/appkit-common'
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
import { formatUnits, parseUnits, type GetEnsAddressReturnType, type Hex } from 'viem'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { normalize } from 'viem/ens'

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
    this.setupWatchers()
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
          options: { projectId: options.projectId },
          provider: this.avaiableConnectors.find(c => c.id === ConstantsUtil.AUTH_CONNECTOR_ID)
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
    const { caipAddress, caipNetwork, ...data } = params
    const chainId = Number(NetworkUtil.caipNetworkIdToNumber(caipNetwork.id))
    const tx = await wagmiWriteContract(this.wagmiConfig, {
      chain: this.wagmiChains?.[chainId],
      chainId,
      address: data.tokenAddress as Hex,
      account: caipAddress as Hex,
      abi: data.abi,
      functionName: data.method,
      args: [data.receiverAddress, data.tokenAmount]
    })

    return { hash: tx }
  }

  public async getEnsAddress(
    params: AdapterBlueprint.GetEnsAddressParams
  ): Promise<AdapterBlueprint.GetEnsAddressResult> {
    const { name, appKit, caipNetwork } = params

    try {
      if (!this.wagmiConfig) {
        throw new Error(
          'networkControllerClient:getApprovedCaipNetworksData - wagmiConfig is undefined'
        )
      }

      let ensName: boolean | GetEnsAddressReturnType = false
      let wcName: boolean | string = false
      if (isReownName(name)) {
        wcName = (await appKit?.resolveReownName(name)) || false
      }
      if (caipNetwork.chainId === 1) {
        ensName = await wagmiGetEnsAddress(this.wagmiConfig, {
          name: normalize(name),
          chainId: caipNetwork.chainId
        })
      }

      return { address: (ensName as string) || wcName || false }
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
      filteredConnectors.map(async connector => {
        const shouldSkip = ConstantsUtil.AUTH_CONNECTOR_ID === connector.id

        const provider = (await connector.getProvider()) as Provider

        if (!shouldSkip && this.namespace && provider) {
          this.addConnector({
            id: connector.id,
            explorerId: PresetsUtil.ConnectorExplorerIds[connector.id],
            imageUrl: options?.connectorImages?.[connector.id] ?? connector.icon,
            name: PresetsUtil.ConnectorNamesMap[connector.id] ?? connector.name,
            imageId: PresetsUtil.ConnectorImageIds[connector.id],
            type: PresetsUtil.ConnectorTypesMap[connector.type] ?? 'EXTERNAL',
            info: { rdns: connector.id },
            chain: this.namespace,
            chains: [],
            provider
          })
        }
      })
    )
  }

  public async syncConnection(id: string): Promise<AdapterBlueprint.ConnectResult> {
    const connections = getConnections(this.wagmiConfig)
    const connection = connections.find(c => c.connector.id === id)
    const connector = this.wagmiConfig.connectors.find(c => c.id === id)
    const provider = (await connector?.getProvider()) as Provider

    return {
      chainId: connection?.chainId ?? 1,
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

  public async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const caipNetwork = this.caipNetworks?.find((c: CaipNetwork) => c.chainId === params.chainId)

    if (caipNetwork && this.wagmiConfig) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const chainId = params.chainId as number
      const balance = await getBalance(this.wagmiConfig, {
        address: params.address as Hex,
        chainId,
        token: caipNetwork.tokens?.[0]?.address as Hex
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
    await switchChain(this.wagmiConfig, { chainId: params.caipNetwork.chainId as number })
  }
}
