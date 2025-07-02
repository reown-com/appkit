import type { SessionTypes } from '@walletconnect/types'
import UniversalProvider from '@walletconnect/universal-provider'
import type { UniversalProviderOpts } from '@walletconnect/universal-provider'

import type {
  AppKitNetwork,
  AppKitSdkVersion,
  CaipAddress,
  CaipNetwork,
  CaipNetworkId,
  ChainNamespace,
  Hex,
  ParsedCaipAddress,
  SdkVersion
} from '@reown/appkit-common'
import { ConstantsUtil, NetworkUtil, ParseUtil } from '@reown/appkit-common'
import type {
  AccountControllerState,
  ConnectMethod,
  ConnectedWalletInfo,
  ConnectionControllerClient,
  ConnectionControllerState,
  ConnectorType,
  EstimateGasTransactionArgs,
  EventsControllerState,
  Features,
  ModalControllerState,
  NamespaceTypeMap,
  NetworkControllerClient,
  OptionsControllerState,
  PublicStateControllerState,
  RemoteFeatures,
  RouterControllerState,
  SIWXConfig,
  SendTransactionArgs,
  SocialProvider,
  ThemeControllerState,
  UseAppKitAccountReturn,
  UseAppKitNetworkReturn,
  WalletFeature,
  WriteContractArgs
} from '@reown/appkit-controllers'
import {
  AccountController,
  AlertController,
  ApiController,
  AssetUtil,
  BlockchainApiController,
  ChainController,
  ConnectionController,
  ConnectionControllerUtil,
  ConnectorController,
  ConstantsUtil as CoreConstantsUtil,
  CoreHelperUtil,
  EnsController,
  EventsController,
  ModalController,
  OnRampController,
  OptionsController,
  PublicStateController,
  RouterController,
  SIWXUtil,
  SendController,
  SnackController,
  StorageUtil,
  ThemeController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { WalletUtil } from '@reown/appkit-scaffold-ui/utils'
import { setColorTheme, setThemeVariables } from '@reown/appkit-ui'
import {
  CaipNetworksUtil,
  ErrorUtil,
  HelpersUtil,
  LoggerUtil,
  ConstantsUtil as UtilConstantsUtil
} from '@reown/appkit-utils'
import { ProviderUtil } from '@reown/appkit-utils'
import type { ProviderStoreUtilState } from '@reown/appkit-utils'

import type { AdapterBlueprint } from '../adapters/index.js'
import { UniversalAdapter } from '../universal-adapter/client.js'
import { ConfigUtil } from '../utils/ConfigUtil.js'
import { WcConstantsUtil, WcHelpersUtil } from '../utils/index.js'
import type { AppKitOptions } from '../utils/index.js'

export type Adapters = Record<ChainNamespace, AdapterBlueprint>
export interface AppKitOptionsWithSdk extends AppKitOptions {
  sdkVersion: SdkVersion | AppKitSdkVersion
}

// -- Types --------------------------------------------------------------------

export type Views =
  | 'Account'
  | 'Connect'
  | 'Networks'
  | 'ApproveTransaction'
  | 'OnRampProviders'
  | 'ConnectingWalletConnectBasic'
  | 'Swap'
  | 'WhatIsAWallet'
  | 'WhatIsANetwork'
  | 'AllWallets'
  | 'WalletSend'

type ViewArguments = {
  Swap: NonNullable<RouterControllerState['data']>['swap']
}

export interface OpenOptions<View extends Views> {
  view?: View
  uri?: string
  namespace?: ChainNamespace
  arguments?: View extends keyof ViewArguments ? ViewArguments[View] : never
}

export abstract class AppKitBaseClient {
  protected universalProvider?: UniversalProvider
  protected connectionControllerClient?: ConnectionControllerClient
  protected networkControllerClient?: NetworkControllerClient
  protected static instance?: AppKitBaseClient
  protected universalProviderInitPromise?: Promise<void>
  protected caipNetworks?: [CaipNetwork, ...CaipNetwork[]]
  protected defaultCaipNetwork?: CaipNetwork

  public chainAdapters?: Adapters
  public chainNamespaces: ChainNamespace[] = []
  public options: AppKitOptions
  public remoteFeatures: RemoteFeatures = {}
  public version: SdkVersion | AppKitSdkVersion
  public reportedAlertErrors: Record<string, boolean> = {}

  private readyPromise?: Promise<void>

  constructor(options: AppKitOptionsWithSdk) {
    this.options = options
    this.version = options.sdkVersion
    this.caipNetworks = this.extendCaipNetworks(options)
    this.chainNamespaces = this.getChainNamespacesSet(
      options.adapters as AdapterBlueprint[],
      this.caipNetworks
    )
    this.defaultCaipNetwork = this.extendDefaultCaipNetwork(options)
    this.chainAdapters = this.createAdapters(options.adapters as AdapterBlueprint[])
    this.readyPromise = this.initialize(options)
  }

  private getChainNamespacesSet(adapters: AdapterBlueprint[], caipNetworks: CaipNetwork[]) {
    const adapterNamespaces = adapters
      ?.map(adapter => adapter.namespace)
      .filter((namespace): namespace is ChainNamespace => Boolean(namespace))

    if (adapterNamespaces?.length) {
      return [...new Set(adapterNamespaces)]
    }

    const networkNamespaces = caipNetworks?.map(network => network.chainNamespace)

    return [...new Set(networkNamespaces)]
  }

  protected async initialize(options: AppKitOptionsWithSdk) {
    this.initializeProjectSettings(options)
    this.initControllers(options)
    await this.initChainAdapters()
    this.sendInitializeEvent(options)
    if (OptionsController.state.enableReconnect) {
      await this.syncExistingConnection()
      await this.syncAdapterConnections()
    } else {
      await this.unSyncExistingConnection()
    }
    this.remoteFeatures = await ConfigUtil.fetchRemoteFeatures(options)
    OptionsController.setRemoteFeatures(this.remoteFeatures)
    if (this.remoteFeatures.onramp) {
      OnRampController.setOnrampProviders(this.remoteFeatures.onramp)
    }
    // Check allowed origins only if email or social features are enabled
    if (
      OptionsController.state.remoteFeatures?.email ||
      (Array.isArray(OptionsController.state.remoteFeatures?.socials) &&
        OptionsController.state.remoteFeatures?.socials.length > 0)
    ) {
      await this.checkAllowedOrigins()
    }
  }

  private async checkAllowedOrigins() {
    try {
      const allowedOrigins = await ApiController.fetchAllowedOrigins()

      if (!allowedOrigins || !CoreHelperUtil.isClient()) {
        AlertController.open(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')

        return
      }

      const currentOrigin = window.location.origin
      const isOriginAllowed = WcHelpersUtil.isOriginAllowed(
        currentOrigin,
        allowedOrigins,
        WcConstantsUtil.DEFAULT_ALLOWED_ANCESTORS
      )

      if (!isOriginAllowed) {
        AlertController.open(ErrorUtil.ALERT_ERRORS.INVALID_APP_CONFIGURATION, 'error')
      }
    } catch (error) {
      if (!(error instanceof Error)) {
        AlertController.open(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')

        return
      }

      switch (error.message) {
        case 'RATE_LIMITED':
          AlertController.open(ErrorUtil.ALERT_ERRORS.RATE_LIMITED_APP_CONFIGURATION, 'error')
          break
        case 'SERVER_ERROR': {
          const originalError = error.cause instanceof Error ? error.cause : error
          AlertController.open(
            {
              shortMessage: ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.shortMessage,
              longMessage: ErrorUtil.ALERT_ERRORS.SERVER_ERROR_APP_CONFIGURATION.longMessage(
                originalError.message
              )
            },
            'error'
          )
          break
        }
        default:
          AlertController.open(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')
      }
    }
  }

  private sendInitializeEvent(options: AppKitOptionsWithSdk) {
    const { ...optionsCopy } = options
    delete optionsCopy.adapters
    delete optionsCopy.universalProvider

    EventsController.sendEvent({
      type: 'track',
      event: 'INITIALIZE',
      properties: {
        ...optionsCopy,
        networks: options.networks.map(n => n.id),
        siweConfig: {
          options: options.siweConfig?.options || {}
        }
      }
    })
  }

  // -- Controllers initialization ---------------------------------------------------
  protected initControllers(options: AppKitOptionsWithSdk) {
    this.initializeOptionsController(options)
    this.initializeChainController(options)
    this.initializeThemeController(options)
    this.initializeConnectionController(options)
    this.initializeConnectorController()
  }

  protected initializeThemeController(options: AppKitOptions) {
    if (options.themeMode) {
      ThemeController.setThemeMode(options.themeMode)
    }
    if (options.themeVariables) {
      ThemeController.setThemeVariables(options.themeVariables)
    }
  }

  protected initializeChainController(options: AppKitOptions) {
    if (!this.connectionControllerClient || !this.networkControllerClient) {
      throw new Error('ConnectionControllerClient and NetworkControllerClient must be set')
    }
    ChainController.initialize(options.adapters ?? [], this.caipNetworks, {
      connectionControllerClient: this.connectionControllerClient,
      networkControllerClient: this.networkControllerClient
    })
    const network = this.getDefaultNetwork()
    if (network) {
      ChainController.setActiveCaipNetwork(network)
    }
  }

  protected initializeConnectionController(options: AppKitOptions) {
    ConnectionController.initialize(options.adapters ?? [])
    ConnectionController.setWcBasic(options.basic ?? false)
  }

  protected initializeConnectorController() {
    ConnectorController.initialize(this.chainNamespaces)
  }

  protected initializeProjectSettings(options: AppKitOptionsWithSdk) {
    OptionsController.setProjectId(options.projectId)
    OptionsController.setSdkVersion(options.sdkVersion)
  }

  protected initializeOptionsController(options: AppKitOptionsWithSdk) {
    OptionsController.setDebug(options.debug !== false)

    // On by default
    OptionsController.setEnableWalletConnect(options.enableWalletConnect !== false)
    OptionsController.setEnableWalletGuide(options.enableWalletGuide !== false)
    OptionsController.setEnableWallets(options.enableWallets !== false)
    OptionsController.setEIP6963Enabled(options.enableEIP6963 !== false)
    OptionsController.setEnableNetworkSwitch(options.enableNetworkSwitch !== false)
    OptionsController.setEnableReconnect(options.enableReconnect !== false)

    OptionsController.setEnableAuthLogger(options.enableAuthLogger !== false)
    OptionsController.setCustomRpcUrls(options.customRpcUrls)

    OptionsController.setEnableEmbedded(options.enableEmbedded)
    OptionsController.setAllWallets(options.allWallets)
    OptionsController.setIncludeWalletIds(options.includeWalletIds)
    OptionsController.setExcludeWalletIds(options.excludeWalletIds)
    OptionsController.setFeaturedWalletIds(options.featuredWalletIds)
    OptionsController.setTokens(options.tokens)
    OptionsController.setTermsConditionsUrl(options.termsConditionsUrl)
    OptionsController.setPrivacyPolicyUrl(options.privacyPolicyUrl)
    OptionsController.setCustomWallets(options.customWallets)
    OptionsController.setFeatures(options.features)
    OptionsController.setAllowUnsupportedChain(options.allowUnsupportedChain)
    OptionsController.setUniversalProviderConfigOverride(options.universalProviderConfigOverride)
    OptionsController.setPreferUniversalLinks(options.experimental_preferUniversalLinks)

    // Save option in controller
    OptionsController.setDefaultAccountTypes(options.defaultAccountTypes)

    const defaultMetaData = this.getDefaultMetaData()
    if (!options.metadata && defaultMetaData) {
      options.metadata = defaultMetaData
    }
    OptionsController.setMetadata(options.metadata)
    OptionsController.setDisableAppend(options.disableAppend)
    OptionsController.setEnableEmbedded(options.enableEmbedded)
    OptionsController.setSIWX(options.siwx)

    if (!options.projectId) {
      AlertController.open(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')

      return
    }

    const evmAdapter = options.adapters?.find(
      adapter => adapter.namespace === ConstantsUtil.CHAIN.EVM
    )

    // Set the SIWE client for EVM chains
    if (evmAdapter) {
      if (options.siweConfig) {
        if (options.siwx) {
          throw new Error('Cannot set both `siweConfig` and `siwx` options')
        }

        OptionsController.setSIWX(options.siweConfig.mapToSIWX())
      }
    }
  }

  protected getDefaultMetaData() {
    if (CoreHelperUtil.isClient()) {
      return {
        name: document.getElementsByTagName('title')?.[0]?.textContent || '',
        description:
          document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content || '',
        url: window.location.origin,
        icons: [document.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href || '']
      }
    }

    return null
  }

  // -- Network Initialization ---------------------------------------------------
  protected setUnsupportedNetwork(chainId: string | number) {
    const namespace = this.getActiveChainNamespace()

    if (namespace) {
      const unsupportedNetwork = CaipNetworksUtil.getUnsupportedNetwork(`${namespace}:${chainId}`)
      ChainController.setActiveCaipNetwork(unsupportedNetwork)
    }
  }

  protected getDefaultNetwork() {
    return CaipNetworksUtil.getCaipNetworkFromStorage(this.defaultCaipNetwork)
  }

  protected extendCaipNetwork(network: AppKitNetwork, options: AppKitOptions) {
    const extendedNetwork = CaipNetworksUtil.extendCaipNetwork(network, {
      customNetworkImageUrls: options.chainImages,
      projectId: options.projectId
    })

    return extendedNetwork
  }

  protected extendCaipNetworks(options: AppKitOptions) {
    const extendedNetworks = CaipNetworksUtil.extendCaipNetworks(options.networks, {
      customNetworkImageUrls: options.chainImages,
      customRpcUrls: options.customRpcUrls,
      projectId: options.projectId
    })

    return extendedNetworks
  }

  protected extendDefaultCaipNetwork(options: AppKitOptions) {
    const defaultNetwork = options.networks.find(n => n.id === options.defaultNetwork?.id)
    const extendedNetwork = defaultNetwork
      ? CaipNetworksUtil.extendCaipNetwork(defaultNetwork, {
          customNetworkImageUrls: options.chainImages,
          customRpcUrls: options.customRpcUrls,
          projectId: options.projectId
        })
      : undefined

    return extendedNetwork
  }

  private async disconnectNamespace(namespace: ChainNamespace, id?: string) {
    try {
      this.setLoading(true, namespace)

      let disconnectResult: AdapterBlueprint.DisconnectResult = {
        connections: []
      }

      const adapter = this.getAdapter(namespace)
      const { caipAddress } = ChainController.getAccountData(namespace) || {}

      /**
       * When the page loaded, the controller doesn't have address yet.
       * To disconnect, we are checking enableReconnect flag to disconnect the namespace.
       */
      if ((caipAddress || !OptionsController.state.enableReconnect) && adapter?.disconnect) {
        disconnectResult = await adapter.disconnect({ id })
      }

      this.setLoading(false, namespace)

      return disconnectResult
    } catch (error) {
      this.setLoading(false, namespace)
      throw new Error(`Failed to disconnect chains: ${(error as Error).message}`)
    }
  }

  // -- Client Initialization ---------------------------------------------------
  protected createClients() {
    this.connectionControllerClient = {
      connectWalletConnect: async () => {
        const activeChain = ChainController.state.activeChain
        const adapter = this.getAdapter(activeChain)
        const chainId = this.getCaipNetwork(activeChain)?.id
        const connections = ConnectionController.getConnections(activeChain)
        const isMultiWallet = this.remoteFeatures.multiWallet
        const hasConnections = connections.length > 0

        if (!adapter) {
          throw new Error('Adapter not found')
        }

        const result = await adapter.connectWalletConnect(chainId)
        const shouldClose = !hasConnections || !isMultiWallet

        if (shouldClose) {
          this.close()
        }

        this.setClientId(result?.clientId || null)
        StorageUtil.setConnectedNamespaces([...ChainController.state.chains.keys()])
        await this.syncWalletConnectAccount()
        await SIWXUtil.initializeIfEnabled()
      },
      connectExternal: async ({
        id,
        address,
        info,
        type,
        provider,
        chain,
        caipNetwork,
        socialUri
      }) => {
        const activeChain = ChainController.state.activeChain
        const namespace = chain || activeChain
        const adapter = this.getAdapter(namespace)

        if (chain && chain !== activeChain && !caipNetwork) {
          const toConnectNetwork = this.getCaipNetworks().find(
            network => network.chainNamespace === chain
          )
          if (toConnectNetwork) {
            this.setCaipNetwork(toConnectNetwork)
          }
        }

        if (!namespace) {
          throw new Error('connectExternal: namespace not found')
        }

        if (!adapter) {
          throw new Error('connectExternal: adapter not found')
        }

        const fallbackCaipNetwork = this.getCaipNetwork(namespace)

        const res = await adapter.connect({
          id,
          address,
          info,
          type,
          provider,
          socialUri,
          chainId: caipNetwork?.id || fallbackCaipNetwork?.id,
          rpcUrl:
            caipNetwork?.rpcUrls?.default?.http?.[0] ||
            fallbackCaipNetwork?.rpcUrls?.default?.http?.[0]
        })

        if (!res) {
          return undefined
        }

        StorageUtil.addConnectedNamespace(namespace)
        this.syncProvider({ ...res, chainNamespace: namespace })
        this.setStatus('connected', namespace)
        this.syncConnectedWalletInfo(namespace)
        StorageUtil.removeDisconnectedConnectorId(id, namespace)

        return { address: res.address }
      },
      reconnectExternal: async ({ id, info, type, provider }) => {
        const namespace = ChainController.state.activeChain
        const adapter = this.getAdapter(namespace)

        if (!namespace) {
          throw new Error('reconnectExternal: namespace not found')
        }

        if (!adapter) {
          throw new Error('reconnectExternal: adapter not found')
        }

        if (adapter?.reconnect) {
          await adapter?.reconnect({ id, info, type, provider, chainId: this.getCaipNetwork()?.id })
          StorageUtil.addConnectedNamespace(namespace)
          this.syncConnectedWalletInfo(namespace)
        }
      },
      disconnect: async params => {
        const { id: connectorId, chainNamespace, initialDisconnect } = params || {}

        const namespace = chainNamespace || ChainController.state.activeChain
        const namespaces = Array.from(ChainController.state.chains.keys())
        const currentConnectorId = ConnectorController.getConnectorId(namespace)

        const isAuth =
          connectorId === ConstantsUtil.CONNECTOR_ID.AUTH ||
          currentConnectorId === ConstantsUtil.CONNECTOR_ID.AUTH
        const isWalletConnect =
          connectorId === ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT ||
          currentConnectorId === ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

        try {
          let namespacesToDisconnect = chainNamespace ? [chainNamespace] : namespaces

          /*
           * If the connector is WalletConnect or Auth, disconnect all namespaces
           * since they share a single connector instance across all adapters
           */
          if (isWalletConnect || isAuth) {
            namespacesToDisconnect = namespaces
          }

          const disconnectPromises = namespacesToDisconnect.map(async ns => {
            let connectorIdToUse = connectorId

            if ((isWalletConnect || isAuth) && !connectorId) {
              connectorIdToUse = currentConnectorId
            }

            if (initialDisconnect && isAuth) {
              StorageUtil.deleteConnectedSocialProvider()
              namespacesToDisconnect.forEach(ns => {
                StorageUtil.addDisconnectedConnectorId(connectorIdToUse || '', ns)
              })
            }

            const disconnectData = await this.disconnectNamespace(ns, connectorIdToUse)

            if (disconnectData) {
              disconnectData.connections.forEach(connection => {
                if (connection.connectorId === ConstantsUtil.CONNECTOR_ID.AUTH) {
                  StorageUtil.deleteConnectedSocialProvider()
                }

                StorageUtil.addDisconnectedConnectorId(connection.connectorId, ns)
              })
            }

            if (initialDisconnect) {
              this.onDisconnectNamespace({ chainNamespace: ns, closeModal: false })
            }
          })

          const disconnectResults = await Promise.allSettled(disconnectPromises)

          SendController.resetSend()
          ConnectionController.resetWcConnection()

          if (SIWXUtil.getSIWX()?.signOutOnDisconnect) {
            await SIWXUtil.clearSessions()
          }

          ConnectorController.setFilterByNamespace(undefined)
          ConnectionController.syncStorageConnections()

          const failures = disconnectResults.filter(
            (result): result is PromiseRejectedResult => result.status === 'rejected'
          )

          if (failures.length > 0) {
            throw new Error(failures.map(f => f.reason.message).join(', '))
          }

          EventsController.sendEvent({
            type: 'track',
            event: 'DISCONNECT_SUCCESS',
            properties: {
              namespace: chainNamespace || 'all'
            }
          })
        } catch (error) {
          throw new Error(`Failed to disconnect chains: ${(error as Error).message}`)
        }
      },
      checkInstalled: (ids?: string[]) => {
        if (!ids) {
          return Boolean(window.ethereum)
        }

        return ids.some(id => Boolean(window.ethereum?.[String(id)]))
      },
      signMessage: async (message: string) => {
        const namespace = ChainController.state.activeChain
        const adapter = this.getAdapter(ChainController.state.activeChain)

        if (!namespace) {
          throw new Error('signMessage: namespace not found')
        }

        if (!adapter) {
          throw new Error('signMessage: adapter not found')
        }

        const result = await adapter?.signMessage({
          message,
          address: AccountController.state.address as string,
          provider: ProviderUtil.getProvider(namespace)
        })

        return result?.signature || ''
      },
      sendTransaction: async (args: SendTransactionArgs) => {
        const namespace = args.chainNamespace

        if (!namespace) {
          throw new Error('sendTransaction: namespace not found')
        }

        if (CoreConstantsUtil.SEND_SUPPORTED_NAMESPACES.includes(namespace)) {
          const adapter = this.getAdapter(namespace)

          if (!adapter) {
            throw new Error('sendTransaction: adapter not found')
          }

          const provider = ProviderUtil.getProvider(namespace)
          const result = await adapter?.sendTransaction({
            ...args,
            caipNetwork: this.getCaipNetwork(),
            provider
          })

          return result?.hash || ''
        }

        return ''
      },
      estimateGas: async (args: EstimateGasTransactionArgs) => {
        const namespace = args.chainNamespace

        if (namespace === ConstantsUtil.CHAIN.EVM) {
          const adapter = this.getAdapter(namespace)

          if (!adapter) {
            throw new Error('estimateGas: adapter is required but got undefined')
          }

          const provider = ProviderUtil.getProvider(namespace)
          const caipNetwork = this.getCaipNetwork()

          if (!caipNetwork) {
            throw new Error('estimateGas: caipNetwork is required but got undefined')
          }

          const result = await adapter?.estimateGas({ ...args, provider, caipNetwork })

          return result?.gas || 0n
        }

        return 0n
      },
      getEnsAvatar: async () => {
        const namespace = ChainController.state.activeChain

        if (!namespace) {
          throw new Error('getEnsAvatar: namespace is required but got undefined')
        }

        await this.syncIdentity({
          address: AccountController.state.address as string,
          chainId: Number(this.getCaipNetwork()?.id),
          chainNamespace: namespace
        })

        return AccountController.state.profileImage || false
      },
      getEnsAddress: async (name: string) => await WcHelpersUtil.resolveReownName(name),
      writeContract: async (args: WriteContractArgs) => {
        const namespace = ChainController.state.activeChain
        const adapter = this.getAdapter(namespace)

        if (!namespace) {
          throw new Error('writeContract: namespace is required but got undefined')
        }

        if (!adapter) {
          throw new Error('writeContract: adapter is required but got undefined')
        }

        const caipNetwork = this.getCaipNetwork()
        const caipAddress = this.getCaipAddress()
        const provider = ProviderUtil.getProvider(namespace)

        if (!caipNetwork || !caipAddress) {
          throw new Error('writeContract: caipNetwork or caipAddress is required but got undefined')
        }

        const result = await adapter?.writeContract({ ...args, caipNetwork, provider, caipAddress })

        return result?.hash as Hex | null
      },
      parseUnits: (value: string, decimals: number) => {
        const adapter = this.getAdapter(ChainController.state.activeChain)

        if (!adapter) {
          throw new Error('parseUnits: adapter is required but got undefined')
        }

        return adapter?.parseUnits({ value, decimals }) ?? 0n
      },
      formatUnits: (value: bigint, decimals: number) => {
        const adapter = this.getAdapter(ChainController.state.activeChain)

        if (!adapter) {
          throw new Error('formatUnits: adapter is required but got undefined')
        }

        return adapter?.formatUnits({ value, decimals }) ?? '0'
      },
      getCapabilities: async (params: AdapterBlueprint.GetCapabilitiesParams) => {
        const adapter = this.getAdapter(ChainController.state.activeChain)

        if (!adapter) {
          throw new Error('getCapabilities: adapter is required but got undefined')
        }

        return await adapter?.getCapabilities(params)
      },
      grantPermissions: async (params: AdapterBlueprint.GrantPermissionsParams) => {
        const adapter = this.getAdapter(ChainController.state.activeChain)

        if (!adapter) {
          throw new Error('grantPermissions: adapter is required but got undefined')
        }

        return await adapter?.grantPermissions(params)
      },
      revokePermissions: async (params: AdapterBlueprint.RevokePermissionsParams) => {
        const adapter = this.getAdapter(ChainController.state.activeChain)

        if (!adapter) {
          throw new Error('revokePermissions: adapter is required but got undefined')
        }

        if (adapter?.revokePermissions) {
          return await adapter.revokePermissions(params)
        }

        return '0x'
      },
      walletGetAssets: async (params: AdapterBlueprint.WalletGetAssetsParams) => {
        const adapter = this.getAdapter(ChainController.state.activeChain)

        if (!adapter) {
          throw new Error('walletGetAssets: adapter is required but got undefined')
        }

        return (await adapter?.walletGetAssets(params)) ?? {}
      },
      updateBalance: (namespace: ChainNamespace) => {
        const caipNetwork = this.getCaipNetwork(namespace)
        if (!caipNetwork || !AccountController.state.address) {
          return
        }

        this.updateNativeBalance(AccountController.state.address, caipNetwork?.id, namespace)
      }
    }

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => await this.switchCaipNetwork(caipNetwork),
      // eslint-disable-next-line @typescript-eslint/require-await
      getApprovedCaipNetworksData: async () => this.getApprovedCaipNetworksData()
    }

    ConnectionController.setClient(this.connectionControllerClient)
  }

  protected getApprovedCaipNetworksData() {
    const providerType = ProviderUtil.getProviderId(ChainController.state.activeChain)

    if (providerType === UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT) {
      const namespaces = this.universalProvider?.session?.namespaces

      return {
        /*
         * MetaMask Wallet only returns 1 namespace in the session object. This makes it imposible
         * to switch to other networks. Setting supportsAllNetworks to true for MetaMask Wallet
         * will make it possible to switch to other networks.
         */
        supportsAllNetworks:
          this.universalProvider?.session?.peer?.metadata.name === 'MetaMask Wallet',
        approvedCaipNetworkIds: this.getChainsFromNamespaces(namespaces)
      }
    }

    return { supportsAllNetworks: true, approvedCaipNetworkIds: [] }
  }

  protected async switchCaipNetwork(caipNetwork: CaipNetwork) {
    if (!caipNetwork) {
      return
    }

    const networkNamespace = caipNetwork.chainNamespace
    const namespaceAddress = this.getAddressByChainNamespace(caipNetwork.chainNamespace)

    if (namespaceAddress) {
      const provider = ProviderUtil.getProvider(networkNamespace)
      const providerType = ProviderUtil.getProviderId(networkNamespace)

      if (caipNetwork.chainNamespace === ChainController.state.activeChain) {
        const adapter = this.getAdapter(networkNamespace)

        await adapter?.switchNetwork({ caipNetwork, provider, providerType })
      } else {
        this.setCaipNetwork(caipNetwork)
        if (providerType === UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT) {
          this.syncWalletConnectAccount()
        } else {
          const address = this.getAddressByChainNamespace(networkNamespace)
          if (address) {
            this.syncAccount({
              address,
              chainId: caipNetwork.id,
              chainNamespace: networkNamespace
            })
          }
        }
      }
    } else {
      this.setCaipNetwork(caipNetwork)
    }
  }

  protected getChainsFromNamespaces(namespaces: SessionTypes.Namespaces = {}): CaipNetworkId[] {
    return Object.values(namespaces).flatMap((namespace: SessionTypes.BaseNamespace) => {
      const chains = (namespace.chains || []) as CaipNetworkId[]
      const accountsChains = namespace.accounts.map(account => {
        const { chainId, chainNamespace } = ParseUtil.parseCaipAddress(account as CaipAddress)

        return `${chainNamespace}:${chainId}`
      })

      return Array.from(new Set([...chains, ...accountsChains]))
    }) as CaipNetworkId[]
  }

  // -- Adapter Initialization ---------------------------------------------------
  protected createAdapters(blueprints?: AdapterBlueprint[]) {
    this.createClients()

    return this.chainNamespaces.reduce<Adapters>((adapters, namespace) => {
      const blueprint = blueprints?.find(b => b.namespace === namespace)
      if (blueprint) {
        blueprint.construct({
          namespace,
          projectId: this.options?.projectId,
          networks: this.getCaipNetworks()
        })
        adapters[namespace] = blueprint
      } else {
        adapters[namespace] = new UniversalAdapter({
          namespace,
          networks: this.getCaipNetworks()
        })
      }

      return adapters
      // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    }, {} as Adapters)
  }

  protected async initChainAdapter(namespace: ChainNamespace) {
    this.onConnectors(namespace)
    this.listenAdapter(namespace)
    await this.chainAdapters?.[namespace].syncConnectors(this.options, this)
    await this.createUniversalProviderForAdapter(namespace)
  }

  protected async initChainAdapters() {
    await Promise.all(
      this.chainNamespaces.map(async namespace => {
        await this.initChainAdapter(namespace)
      })
    )
  }

  protected onConnectors(chainNamespace: ChainNamespace) {
    const adapter = this.getAdapter(chainNamespace)

    adapter?.on('connectors', this.setConnectors.bind(this))
  }

  protected listenAdapter(chainNamespace: ChainNamespace) {
    const adapter = this.getAdapter(chainNamespace)

    if (!adapter) {
      return
    }

    const connectionStatus = StorageUtil.getConnectionStatus()

    if (OptionsController.state.enableReconnect === false) {
      this.setStatus('disconnected', chainNamespace)
    } else if (connectionStatus === 'connected') {
      this.setStatus('connecting', chainNamespace)
    } else if (connectionStatus === 'disconnected') {
      /*
       * Address cache is kept after disconnecting from the wallet
       * but should be cleared if appkit is launched in disconnected state
       */
      StorageUtil.clearAddressCache()
      this.setStatus(connectionStatus, chainNamespace)
    } else {
      this.setStatus(connectionStatus, chainNamespace)
    }

    adapter.on('switchNetwork', ({ address, chainId }) => {
      const caipNetwork = this.getCaipNetworks().find(
        n =>
          n.id.toString() === chainId.toString() ||
          n.caipNetworkId.toString() === chainId.toString()
      )
      const isSameNamespace = ChainController.state.activeChain === chainNamespace
      const accountAddress = ChainController.getAccountProp('address', chainNamespace)

      if (caipNetwork) {
        const account = isSameNamespace && address ? address : accountAddress

        if (account) {
          this.syncAccount({ address: account, chainId: caipNetwork.id, chainNamespace })
        }
      } else {
        this.setUnsupportedNetwork(chainId)
      }
    })

    adapter.on('disconnect', () => {
      this.onDisconnectNamespace({ chainNamespace })
    })

    adapter.on('connections', connections => {
      this.setConnections(connections, chainNamespace)
    })

    adapter.on('pendingTransactions', () => {
      const address = AccountController.state.address
      const activeCaipNetwork = ChainController.state.activeCaipNetwork

      if (!address || !activeCaipNetwork?.id) {
        return
      }

      this.updateNativeBalance(address, activeCaipNetwork.id, activeCaipNetwork.chainNamespace)
    })

    adapter.on('accountChanged', ({ address, chainId, connector }) => {
      const isActiveChain = ChainController.state.activeChain === chainNamespace

      if (connector?.provider) {
        this.syncProvider({
          id: connector.id,
          type: connector.type,
          provider: connector.provider,
          chainNamespace
        })
        this.syncConnectedWalletInfo(chainNamespace)
      }

      if (isActiveChain && chainId) {
        this.syncAccount({
          address,
          chainId,
          chainNamespace
        })
      } else if (isActiveChain && ChainController.state.activeCaipNetwork?.id) {
        this.syncAccount({
          address,
          chainId: ChainController.state.activeCaipNetwork?.id,
          chainNamespace
        })
      } else {
        this.syncAccountInfo(address, chainId, chainNamespace)
      }

      StorageUtil.addConnectedNamespace(chainNamespace)
    })
  }

  protected async createUniversalProviderForAdapter(chainNamespace: ChainNamespace) {
    await this.getUniversalProvider()

    if (this.universalProvider) {
      await this.chainAdapters?.[chainNamespace]?.setUniversalProvider?.(this.universalProvider)
    }
  }

  // -- UI Initialization ---------------------------------------------------
  protected abstract injectModalUi(): Promise<void>
  public abstract syncIdentity(
    params: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
      chainNamespace: ChainNamespace
    }
  ): Promise<void>

  // -- Connection Sync ---------------------------------------------------
  protected async syncExistingConnection() {
    await Promise.allSettled(
      this.chainNamespaces.map(namespace => this.syncNamespaceConnection(namespace))
    )
  }

  protected async unSyncExistingConnection() {
    try {
      await Promise.allSettled(
        this.chainNamespaces.map(namespace =>
          ConnectionController.disconnect({ namespace, initialDisconnect: true })
        )
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error disconnecting existing connections:', error)
    }
  }

  protected async syncNamespaceConnection(namespace: ChainNamespace) {
    try {
      if (namespace === ConstantsUtil.CHAIN.EVM && CoreHelperUtil.isSafeApp()) {
        ConnectorController.setConnectorId(ConstantsUtil.CONNECTOR_ID.SAFE, namespace)
      }

      const connectorId = ConnectorController.getConnectorId(namespace)

      this.setStatus('connecting', namespace)

      switch (connectorId) {
        case ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT:
          await this.syncWalletConnectAccount()
          break
        case ConstantsUtil.CONNECTOR_ID.AUTH:
          // Handled during initialization of adapters' auth provider
          break
        default:
          await this.syncAdapterConnection(namespace)
      }
    } catch (err) {
      console.warn("AppKit couldn't sync existing connection", err)
      this.setStatus('disconnected', namespace)
    }
  }

  protected onDisconnectNamespace(options: {
    chainNamespace: ChainNamespace
    closeModal?: boolean
  }) {
    const { chainNamespace, closeModal } = options || {}

    ChainController.resetAccount(chainNamespace)
    ChainController.resetNetwork(chainNamespace)

    ConnectorController.removeConnectorId(chainNamespace)

    StorageUtil.removeConnectedNamespace(chainNamespace)
    ProviderUtil.resetChain(chainNamespace)

    this.setUser(undefined, chainNamespace)
    this.setStatus('disconnected', chainNamespace)
    this.setConnectedWalletInfo(undefined, chainNamespace)

    if (closeModal !== false) {
      ModalController.close()
    }
  }

  protected async syncAdapterConnections() {
    await Promise.allSettled(
      this.chainNamespaces.map(namespace => {
        const caipAddress = this.getCaipAddress(namespace)
        const caipNetwork = this.getCaipNetwork(namespace)

        return this.chainAdapters?.[namespace].syncConnections({
          connectToFirstConnector: !caipAddress,
          caipNetwork,
          getConnectorStorageInfo(connectorId) {
            const storageConnectionsByNamespace = StorageUtil.getConnections()
            const storageConnections = storageConnectionsByNamespace[namespace] ?? []

            return {
              hasDisconnected: StorageUtil.isConnectorDisconnected(connectorId, namespace),
              hasConnected: storageConnections.some(c =>
                HelpersUtil.isLowerCaseMatch(c.connectorId, connectorId)
              )
            }
          }
        })
      })
    )
  }

  protected async syncAdapterConnection(namespace: ChainNamespace) {
    const adapter = this.getAdapter(namespace)
    const connectorId = ConnectorController.getConnectorId(namespace)
    const caipNetwork = this.getCaipNetwork(namespace)
    const connectors = ConnectorController.getConnectors(namespace)

    const connector = connectors.find(c => c.id === connectorId)

    try {
      if (!adapter || !connector) {
        throw new Error(`Adapter or connector not found for namespace ${namespace}`)
      }

      if (!caipNetwork?.id) {
        throw new Error('CaipNetwork not found')
      }

      const connection = await adapter?.syncConnection({
        namespace,
        id: connector.id,
        chainId: caipNetwork.id,
        rpcUrl: caipNetwork?.rpcUrls?.default?.http?.[0] as string
      })

      if (connection) {
        this.syncProvider({ ...connection, chainNamespace: namespace })
        await this.syncAccount({ ...connection, chainNamespace: namespace })
        this.setStatus('connected', namespace)
      } else {
        this.setStatus('disconnected', namespace)
      }
    } catch (e) {
      this.onDisconnectNamespace({ chainNamespace: namespace, closeModal: false })
    }
  }

  protected async syncWalletConnectAccount() {
    const sessionNamespaces = Object.keys(this.universalProvider?.session?.namespaces || {})
    const syncTasks = this.chainNamespaces.map(async chainNamespace => {
      const adapter = this.getAdapter(chainNamespace)

      if (!adapter) {
        return
      }

      const namespaceAccounts =
        this.universalProvider?.session?.namespaces?.[chainNamespace]?.accounts || []

      // We try and find the address for this network in the session object.
      const activeChainId = ChainController.state.activeCaipNetwork?.id

      const sessionAddress =
        namespaceAccounts.find(account => {
          const { chainId } = ParseUtil.parseCaipAddress(account as CaipAddress)

          return chainId === activeChainId?.toString()
        }) || namespaceAccounts[0]

      if (sessionAddress) {
        const caipAddress = ParseUtil.validateCaipAddress(sessionAddress)
        const { chainId, address } = ParseUtil.parseCaipAddress(caipAddress)
        ProviderUtil.setProviderId(
          chainNamespace,
          UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT as ConnectorType
        )

        if (
          this.caipNetworks &&
          ChainController.state.activeCaipNetwork &&
          adapter.namespace !== ConstantsUtil.CHAIN.EVM
        ) {
          const provider = adapter.getWalletConnectProvider({
            caipNetworks: this.getCaipNetworks(),
            provider: this.universalProvider,
            activeCaipNetwork: ChainController.state.activeCaipNetwork
          })
          ProviderUtil.setProvider(chainNamespace, provider)
        } else {
          ProviderUtil.setProvider(chainNamespace, this.universalProvider)
        }

        ConnectorController.setConnectorId(
          ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT,
          chainNamespace
        )
        StorageUtil.addConnectedNamespace(chainNamespace)

        await this.syncAccount({
          address,
          chainId,
          chainNamespace
        })
      } else if (sessionNamespaces.includes(chainNamespace)) {
        this.setStatus('disconnected', chainNamespace)
      }

      this.syncConnectedWalletInfo(chainNamespace)
      await ChainController.setApprovedCaipNetworksData(chainNamespace)
    })

    await Promise.all(syncTasks)
  }

  protected syncProvider({
    type,
    provider,
    id,
    chainNamespace
  }: Pick<AdapterBlueprint.ConnectResult, 'type' | 'provider' | 'id'> & {
    chainNamespace: ChainNamespace
  }) {
    ProviderUtil.setProviderId(chainNamespace, type)
    ProviderUtil.setProvider(chainNamespace, provider)
    ConnectorController.setConnectorId(id, chainNamespace)
  }

  protected async syncAccount(
    params: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
      chainNamespace: ChainNamespace
    }
  ) {
    const isActiveNamespace = params.chainNamespace === ChainController.state.activeChain
    const networkOfChain = ChainController.getCaipNetworkByNamespace(
      params.chainNamespace,
      params.chainId
    )

    const { address, chainId, chainNamespace } = params

    const { chainId: activeChainId } = StorageUtil.getActiveNetworkProps()
    const chainIdToUse = chainId || activeChainId
    const isUnsupportedNetwork =
      ChainController.state.activeCaipNetwork?.name === ConstantsUtil.UNSUPPORTED_NETWORK_NAME
    const shouldSupportAllNetworks = ChainController.getNetworkProp(
      'supportsAllNetworks',
      chainNamespace
    )

    this.setStatus('connected', chainNamespace)
    if (isUnsupportedNetwork && !shouldSupportAllNetworks) {
      return
    }

    if (chainIdToUse) {
      let caipNetwork = this.getCaipNetworks().find(
        n => n.id.toString() === chainIdToUse.toString()
      )
      let fallbackCaipNetwork = this.getCaipNetworks().find(
        n => n.chainNamespace === chainNamespace
      )

      // If doesn't support all networks, we need to use approved networks
      if (!shouldSupportAllNetworks && !caipNetwork && !fallbackCaipNetwork) {
        // Connection can be requested for a chain that is not supported by the wallet so we need to use approved networks here
        const caipNetworkIds = this.getApprovedCaipNetworkIds() || []
        const caipNetworkId = caipNetworkIds.find(
          id => ParseUtil.parseCaipNetworkId(id)?.chainId === chainIdToUse.toString()
        )
        const fallBackCaipNetworkId = caipNetworkIds.find(
          id => ParseUtil.parseCaipNetworkId(id)?.chainNamespace === chainNamespace
        )

        caipNetwork = this.getCaipNetworks().find(n => n.caipNetworkId === caipNetworkId)
        fallbackCaipNetwork = this.getCaipNetworks().find(
          n =>
            n.caipNetworkId === fallBackCaipNetworkId ||
            // This is a workaround used in Solana network to support deprecated caipNetworkId
            ('deprecatedCaipNetworkId' in n && n.deprecatedCaipNetworkId === fallBackCaipNetworkId)
        )
      }

      const network = caipNetwork || fallbackCaipNetwork

      if (network?.chainNamespace === ChainController.state.activeChain) {
        // If the network is unsupported and the user doesn't allow unsupported chains, we show the unsupported chain UI
        if (
          OptionsController.state.enableNetworkSwitch &&
          !OptionsController.state.allowUnsupportedChain &&
          ChainController.state.activeCaipNetwork?.name === ConstantsUtil.UNSUPPORTED_NETWORK_NAME
        ) {
          ChainController.showUnsupportedChainUI()
        } else {
          this.setCaipNetwork(network)
        }
      } else if (!isActiveNamespace) {
        if (networkOfChain) {
          this.setCaipNetworkOfNamespace(networkOfChain, chainNamespace)
        }
      }

      this.syncConnectedWalletInfo(chainNamespace)

      if (!HelpersUtil.isLowerCaseMatch(address, AccountController.state.address)) {
        this.syncAccountInfo(address, network?.id, chainNamespace)
      }

      if (isActiveNamespace) {
        await this.syncBalance({ address, chainId: network?.id, chainNamespace })
      } else {
        await this.syncBalance({ address, chainId: networkOfChain?.id, chainNamespace })
      }
    }
  }

  private async syncAccountInfo(
    address: string,
    chainId: string | number | undefined,
    chainNamespace: ChainNamespace
  ) {
    const caipAddress = this.getCaipAddress(chainNamespace)
    const newChainId = chainId || caipAddress?.split(':')[1]

    if (!newChainId) {
      return
    }

    const newCaipAddress = `${chainNamespace}:${newChainId}:${address}`

    this.setCaipAddress(newCaipAddress as CaipAddress, chainNamespace)
    await this.syncIdentity({
      address,
      chainId: newChainId,
      chainNamespace
    })
  }

  protected async syncReownName(address: string, chainNamespace: ChainNamespace) {
    try {
      const registeredWcNames = await this.getReownName(address)
      if (registeredWcNames[0]) {
        const wcName = registeredWcNames[0]
        this.setProfileName(wcName.name, chainNamespace)
      } else {
        this.setProfileName(null, chainNamespace)
      }
    } catch {
      this.setProfileName(null, chainNamespace)
    }
  }

  protected syncConnectedWalletInfo(chainNamespace: ChainNamespace) {
    const connectorId = ConnectorController.getConnectorId(chainNamespace)
    const providerType = ProviderUtil.getProviderId(chainNamespace)

    if (
      providerType === UtilConstantsUtil.CONNECTOR_TYPE_ANNOUNCED ||
      providerType === UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
    ) {
      if (connectorId) {
        const connector = this.getConnectors().find(c => {
          const isConnectorId = c.id === connectorId
          const isRdns = c.info?.rdns === connectorId

          const hasMultiChainConnector = c.connectors?.some(
            _c => _c.id === connectorId || _c.info?.rdns === connectorId
          )

          return isConnectorId || isRdns || Boolean(hasMultiChainConnector)
        })
        if (connector) {
          const { info, name, imageUrl } = connector
          const icon = imageUrl || this.getConnectorImage(connector)
          this.setConnectedWalletInfo({ name, icon, ...info }, chainNamespace)
        }
      }
    } else if (providerType === UtilConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT) {
      const provider = ProviderUtil.getProvider(chainNamespace)

      if (provider?.session) {
        this.setConnectedWalletInfo(
          {
            ...provider.session.peer.metadata,
            name: provider.session.peer.metadata.name,
            icon: provider.session.peer.metadata.icons?.[0]
          },
          chainNamespace
        )
      }
    } else if (connectorId) {
      if (connectorId === ConstantsUtil.CONNECTOR_ID.COINBASE) {
        const connector = this.getConnectors().find(
          c => c.id === ConstantsUtil.CONNECTOR_ID.COINBASE
        )

        this.setConnectedWalletInfo(
          { name: 'Coinbase Wallet', icon: this.getConnectorImage(connector) },
          chainNamespace
        )
      }
    }
  }

  protected async syncBalance(params: {
    address: string
    chainId: string | number | undefined
    chainNamespace: ChainNamespace
  }) {
    const caipNetwork = NetworkUtil.getNetworksByNamespace(
      this.getCaipNetworks(),
      params.chainNamespace
    ).find(n => n.id.toString() === params.chainId?.toString())

    if (!caipNetwork || !params.chainId) {
      return
    }

    await this.updateNativeBalance(params.address, params.chainId, params.chainNamespace)
  }

  public async ready() {
    await this.readyPromise
  }

  public async updateNativeBalance(
    address: string,
    chainId: string | number,
    namespace: ChainNamespace
  ) {
    const adapter = this.getAdapter(namespace)
    const caipNetwork = ChainController.getCaipNetworkByNamespace(namespace, chainId)

    if (adapter) {
      const balance = await adapter.getBalance({
        address,
        chainId,
        caipNetwork,
        tokens: this.options.tokens
      })
      this.setBalance(balance.balance, balance.symbol, namespace)

      return balance
    }

    return undefined
  }

  // -- Universal Provider ---------------------------------------------------
  protected async initializeUniversalAdapter() {
    const logger = LoggerUtil.createLogger((error, ...args) => {
      if (error) {
        this.handleAlertError(error)
      }
      // eslint-disable-next-line no-console
      console.error(...args)
    })

    const universalProviderOptions: UniversalProviderOpts = {
      projectId: this.options?.projectId,
      metadata: {
        name: this.options?.metadata ? this.options?.metadata.name : '',
        description: this.options?.metadata ? this.options?.metadata.description : '',
        url: this.options?.metadata ? this.options?.metadata.url : '',
        icons: this.options?.metadata ? this.options?.metadata.icons : ['']
      },
      logger
    }

    OptionsController.setManualWCControl(Boolean(this.options?.manualWCControl))
    this.universalProvider =
      this.options.universalProvider ?? (await UniversalProvider.init(universalProviderOptions))
    // Clear the session if we don't want to reconnect on init
    if (OptionsController.state.enableReconnect === false && this.universalProvider.session) {
      await this.universalProvider.disconnect()
    }
    this.listenWalletConnect()
  }

  protected listenWalletConnect() {
    if (this.universalProvider) {
      this.chainNamespaces.forEach(namespace => {
        WcHelpersUtil.listenWcProvider({
          universalProvider: this.universalProvider as UniversalProvider,
          namespace,
          onDisplayUri: uri => {
            ConnectionController.setUri(uri)
          },
          onConnect: () => {
            ConnectionController.finalizeWcConnection()
          },
          onDisconnect: () => {
            if (ChainController.state.noAdapters) {
              this.resetAccount(namespace)
            }
            ConnectionController.resetWcConnection()
          },
          onChainChanged: chainId => {
            const activeNamespace = ChainController.state.activeChain
            const isCurrentConnectorWalletConnect =
              activeNamespace &&
              ConnectorController.state.activeConnectorIds[activeNamespace] ===
                ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

            if (
              activeNamespace === namespace &&
              (ChainController.state.noAdapters || isCurrentConnectorWalletConnect)
            ) {
              const caipNetwork = this.getCaipNetworks().find(
                n =>
                  n.id.toString() === chainId.toString() ||
                  n.caipNetworkId.toString() === chainId.toString()
              )

              const currentCaipNetwork = this.getCaipNetwork()

              if (!caipNetwork) {
                this.setUnsupportedNetwork(chainId)

                return
              }

              if (
                currentCaipNetwork?.id.toString() !== caipNetwork?.id.toString() &&
                currentCaipNetwork?.chainNamespace === caipNetwork?.chainNamespace
              ) {
                this.setCaipNetwork(caipNetwork)
              }
            }
          },
          onAccountsChanged: accounts => {
            const activeNamespace = ChainController.state.activeChain
            const isCurrentConnectorWalletConnect =
              activeNamespace &&
              ConnectorController.state.activeConnectorIds[activeNamespace] ===
                ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT

            if (
              activeNamespace === namespace &&
              (ChainController.state.noAdapters || isCurrentConnectorWalletConnect)
            ) {
              if (accounts.length > 0) {
                const account = accounts[0] as ParsedCaipAddress

                this.syncAccount({
                  address: account.address,
                  chainId: account.chainId,
                  chainNamespace: account.chainNamespace
                })
              }
            }
          }
        })
      })
    }
  }

  protected createUniversalProvider() {
    if (
      !this.universalProviderInitPromise &&
      CoreHelperUtil.isClient() &&
      this.options?.projectId
    ) {
      this.universalProviderInitPromise = this.initializeUniversalAdapter()
    }

    return this.universalProviderInitPromise
  }

  public async getUniversalProvider() {
    if (!this.universalProvider) {
      try {
        await this.createUniversalProvider()
      } catch (err) {
        EventsController.sendEvent({
          type: 'error',
          event: 'INTERNAL_SDK_ERROR',
          properties: {
            errorType: 'UniversalProviderInitError',
            errorMessage: err instanceof Error ? err.message : 'Unknown',
            uncaught: false
          }
        })
        // eslint-disable-next-line no-console
        console.error('AppKit:getUniversalProvider - Cannot create provider', err)
      }
    }

    return this.universalProvider
  }

  // - Utils -------------------------------------------------------------------
  protected handleAlertError(error: Error) {
    const matchedUniversalProviderError = Object.entries(ErrorUtil.UniversalProviderErrors).find(
      ([, { message }]) => error.message.includes(message)
    )

    const [errorKey, errorValue] = matchedUniversalProviderError ?? []

    const { message, alertErrorKey } = errorValue ?? {}

    if (errorKey && message && !this.reportedAlertErrors[errorKey]) {
      const alertError =
        ErrorUtil.ALERT_ERRORS[alertErrorKey as keyof typeof ErrorUtil.ALERT_ERRORS]

      if (alertError) {
        AlertController.open(alertError, 'error')
        this.reportedAlertErrors[errorKey] = true
      }
    }
  }

  protected getAdapter(namespace?: ChainNamespace) {
    if (!namespace) {
      return undefined
    }

    return this.chainAdapters?.[namespace]
  }

  protected createAdapter(blueprint: AdapterBlueprint) {
    if (!blueprint) {
      return
    }

    const namespace = blueprint.namespace
    if (!namespace) {
      return
    }

    this.createClients()

    const adapterBlueprint: AdapterBlueprint = blueprint
    adapterBlueprint.namespace = namespace
    adapterBlueprint.construct({
      namespace,
      projectId: this.options?.projectId,
      networks: this.getCaipNetworks()
    })

    if (!this.chainNamespaces.includes(namespace)) {
      this.chainNamespaces.push(namespace)
    }

    if (this.chainAdapters) {
      this.chainAdapters[namespace] = adapterBlueprint
    }
  }

  // -- Public Internal ---------------------------------------------------
  public getCaipNetwork = (chainNamespace?: ChainNamespace, id?: string | number) => {
    if (chainNamespace) {
      const caipNetworkWithId = ChainController.getNetworkData(
        chainNamespace
      )?.requestedCaipNetworks?.find(c => c.id === id)

      if (caipNetworkWithId) {
        return caipNetworkWithId
      }

      const namespaceCaipNetwork = ChainController.getNetworkData(chainNamespace)?.caipNetwork

      if (namespaceCaipNetwork) {
        return namespaceCaipNetwork
      }

      const requestedCaipNetworks = ChainController.getRequestedCaipNetworks(chainNamespace)

      return requestedCaipNetworks.filter(c => c.chainNamespace === chainNamespace)?.[0]
    }

    return ChainController.state.activeCaipNetwork || this.defaultCaipNetwork
  }

  public getCaipNetworkId = <T extends number | string>(): T | undefined => {
    const network = this.getCaipNetwork()

    if (network) {
      return network.id as T
    }

    return undefined
  }

  public getCaipNetworks = (namespace?: ChainNamespace) =>
    ChainController.getCaipNetworks(namespace)

  public getActiveChainNamespace = () => ChainController.state.activeChain

  public setRequestedCaipNetworks: (typeof ChainController)['setRequestedCaipNetworks'] = (
    requestedCaipNetworks,
    chain: ChainNamespace
  ) => {
    ChainController.setRequestedCaipNetworks(requestedCaipNetworks, chain)
  }

  public getApprovedCaipNetworkIds: (typeof ChainController)['getAllApprovedCaipNetworkIds'] = () =>
    ChainController.getAllApprovedCaipNetworkIds()

  public getCaipAddress = (chainNamespace?: ChainNamespace) => {
    if (ChainController.state.activeChain === chainNamespace || !chainNamespace) {
      return ChainController.state.activeCaipAddress
    }

    return ChainController.getAccountProp('caipAddress', chainNamespace)
  }

  public setClientId: (typeof BlockchainApiController)['setClientId'] = clientId => {
    BlockchainApiController.setClientId(clientId)
  }

  public getProvider = <T>(namespace: ChainNamespace) => ProviderUtil.getProvider<T>(namespace)

  public getProviderType = (namespace: ChainNamespace) => ProviderUtil.getProviderId(namespace)

  public getPreferredAccountType = (namespace: ChainNamespace) => getPreferredAccountType(namespace)

  public setCaipAddress: (typeof AccountController)['setCaipAddress'] = (caipAddress, chain) => {
    AccountController.setCaipAddress(caipAddress, chain)
  }

  public setBalance: (typeof AccountController)['setBalance'] = (balance, balanceSymbol, chain) => {
    AccountController.setBalance(balance, balanceSymbol, chain)
  }

  public setProfileName: (typeof AccountController)['setProfileName'] = (profileName, chain) => {
    AccountController.setProfileName(profileName, chain)
  }

  public setProfileImage: (typeof AccountController)['setProfileImage'] = (profileImage, chain) => {
    AccountController.setProfileImage(profileImage, chain)
  }

  public setUser: (typeof AccountController)['setUser'] = (user, chain) => {
    AccountController.setUser(user, chain)
  }

  public resetAccount: (typeof AccountController)['resetAccount'] = (chain: ChainNamespace) => {
    AccountController.resetAccount(chain)
  }

  public setCaipNetwork: (typeof ChainController)['setActiveCaipNetwork'] = caipNetwork => {
    ChainController.setActiveCaipNetwork(caipNetwork)
  }

  public setCaipNetworkOfNamespace = (caipNetwork: CaipNetwork, chainNamespace: ChainNamespace) => {
    ChainController.setChainNetworkData(chainNamespace, { caipNetwork })
  }

  public setStatus: (typeof AccountController)['setStatus'] = (status, chain) => {
    AccountController.setStatus(status, chain)

    // If at least one namespace is connected, set the connection status
    if (ConnectorController.isConnected()) {
      StorageUtil.setConnectionStatus('connected')
    } else {
      StorageUtil.setConnectionStatus('disconnected')
    }
  }

  public getAddressByChainNamespace = (chainNamespace: ChainNamespace) =>
    ChainController.getAccountProp('address', chainNamespace)

  public setConnectors: (typeof ConnectorController)['setConnectors'] = connectors => {
    const allConnectors = [...ConnectorController.state.allConnectors, ...connectors]
    ConnectorController.setConnectors(allConnectors)
  }

  public setConnections: (typeof ConnectionController)['setConnections'] = (
    connections,
    chainNamespace
  ) => {
    StorageUtil.setConnections(connections, chainNamespace)
    ConnectionController.setConnections(connections, chainNamespace)
  }

  public fetchIdentity: (typeof BlockchainApiController)['fetchIdentity'] = request =>
    BlockchainApiController.fetchIdentity(request)

  public getReownName: (typeof EnsController)['getNamesForAddress'] = address =>
    EnsController.getNamesForAddress(address)

  public getConnectors: (typeof ConnectorController)['getConnectors'] = () =>
    ConnectorController.getConnectors()

  public getConnectorImage: (typeof AssetUtil)['getConnectorImage'] = connector =>
    AssetUtil.getConnectorImage(connector)

  public getConnections = (namespace: ChainNamespace) => {
    if (!this.remoteFeatures.multiWallet) {
      AlertController.open(
        ConstantsUtil.REMOTE_FEATURES_ALERTS.MULTI_WALLET_NOT_ENABLED.DEFAULT,
        'info'
      )

      return []
    }

    return ConnectionControllerUtil.getConnectionsData(namespace).connections
  }

  public getRecentConnections = (namespace: ChainNamespace) => {
    if (!this.remoteFeatures.multiWallet) {
      AlertController.open(
        ConstantsUtil.REMOTE_FEATURES_ALERTS.MULTI_WALLET_NOT_ENABLED.DEFAULT,
        'info'
      )

      return []
    }

    return ConnectionControllerUtil.getConnectionsData(namespace).recentConnections
  }

  public switchConnection: (typeof ConnectionController)['switchConnection'] = async params => {
    if (!this.remoteFeatures.multiWallet) {
      AlertController.open(
        ConstantsUtil.REMOTE_FEATURES_ALERTS.MULTI_WALLET_NOT_ENABLED.DEFAULT,
        'info'
      )

      return
    }

    await ConnectionController.switchConnection(params)
  }

  public deleteConnection: (typeof StorageUtil)['deleteAddressFromConnection'] = params => {
    if (!this.remoteFeatures.multiWallet) {
      AlertController.open(
        ConstantsUtil.REMOTE_FEATURES_ALERTS.MULTI_WALLET_NOT_ENABLED.DEFAULT,
        'info'
      )

      return
    }

    StorageUtil.deleteAddressFromConnection(params)
    ConnectionController.syncStorageConnections()
  }

  public setConnectedWalletInfo: (typeof AccountController)['setConnectedWalletInfo'] = (
    connectedWalletInfo,
    chain
  ) => {
    const type = ProviderUtil.getProviderId(chain)
    const walletInfo = connectedWalletInfo ? { ...connectedWalletInfo, type } : undefined
    AccountController.setConnectedWalletInfo(walletInfo, chain)
  }

  // -- Public -------------------------------------------------------------------
  public async open<View extends Views>(options?: OpenOptions<View>) {
    await this.injectModalUi()

    if (options?.uri) {
      ConnectionController.setUri(options.uri)
    }

    if (options?.arguments) {
      switch (options?.view) {
        case 'Swap':
          return ModalController.open({ ...options, data: { swap: options.arguments } })
        default:
      }
    }

    return ModalController.open(options)
  }

  public async close() {
    await this.injectModalUi()
    ModalController.close()
  }

  public setLoading(loading: ModalControllerState['loading'], namespace?: ChainNamespace) {
    ModalController.setLoading(loading, namespace)
  }

  public async disconnect(chainNamespace?: ChainNamespace) {
    await ConnectionController.disconnect({ namespace: chainNamespace })
  }

  public getSIWX<SIWXConfigInterface = SIWXConfig>() {
    return OptionsController.state.siwx as SIWXConfigInterface | undefined
  }

  // -- review these -------------------------------------------------------------------
  public getError() {
    return ''
  }

  public getChainId() {
    return ChainController.state.activeCaipNetwork?.id
  }

  public async switchNetwork(appKitNetwork: AppKitNetwork) {
    const network = this.getCaipNetworks().find(n => n.id === appKitNetwork.id)
    if (!network) {
      AlertController.open(ErrorUtil.ALERT_ERRORS.SWITCH_NETWORK_NOT_FOUND, 'error')

      return
    }
    await ChainController.switchActiveNetwork(network)
  }

  public getWalletProvider() {
    return ChainController.state.activeChain
      ? ProviderUtil.state.providers[ChainController.state.activeChain]
      : null
  }

  public getWalletProviderType() {
    return ProviderUtil.getProviderId(ChainController.state.activeChain)
  }

  public subscribeProviders(callback: (providers: ProviderStoreUtilState['providers']) => void) {
    return ProviderUtil.subscribeProviders(callback)
  }

  public getThemeMode() {
    return ThemeController.state.themeMode
  }

  public getThemeVariables() {
    return ThemeController.state.themeVariables
  }

  public setThemeMode(themeMode: ThemeControllerState['themeMode']) {
    ThemeController.setThemeMode(themeMode)
    setColorTheme(ThemeController.state.themeMode)
  }

  public setTermsConditionsUrl(termsConditionsUrl: string) {
    OptionsController.setTermsConditionsUrl(termsConditionsUrl)
  }

  public setPrivacyPolicyUrl(privacyPolicyUrl: string) {
    OptionsController.setPrivacyPolicyUrl(privacyPolicyUrl)
  }

  public setThemeVariables(themeVariables: ThemeControllerState['themeVariables']) {
    ThemeController.setThemeVariables(themeVariables)
    setThemeVariables(ThemeController.state.themeVariables)
  }

  public subscribeTheme(callback: (newState: ThemeControllerState) => void) {
    return ThemeController.subscribe(callback)
  }

  public subscribeConnections(callback: (newState: ConnectionControllerState) => void) {
    if (!this.remoteFeatures.multiWallet) {
      AlertController.open(
        ConstantsUtil.REMOTE_FEATURES_ALERTS.MULTI_WALLET_NOT_ENABLED.DEFAULT,
        'info'
      )

      return () => undefined
    }

    return ConnectionController.subscribe(callback)
  }

  public getWalletInfo(namespace?: ChainNamespace) {
    if (namespace) {
      return ChainController.getAccountProp('connectedWalletInfo', namespace)
    }

    return AccountController.state.connectedWalletInfo
  }

  public getAccount(_namespace?: ChainNamespace) {
    const namespace = _namespace || ChainController.state.activeChain
    const authConnector = ConnectorController.getAuthConnector(namespace)
    const accountState = ChainController.getAccountData(namespace)
    const activeConnectorId = StorageUtil.getConnectedConnectorId(ChainController.state.activeChain)
    const connections = ConnectionController.getConnections(namespace)

    if (!namespace) {
      throw new Error('AppKit:getAccount - namespace is required')
    }

    const allAccounts = connections.flatMap(connection =>
      connection.accounts.map(({ address, type }) =>
        CoreHelperUtil.createAccount(
          namespace,
          address,
          (type || 'eoa') as NamespaceTypeMap[ChainNamespace]
        )
      )
    )

    if (!accountState) {
      return undefined
    }

    return {
      allAccounts,
      caipAddress: accountState.caipAddress,
      address: CoreHelperUtil.getPlainAddress(accountState.caipAddress),
      isConnected: Boolean(accountState.caipAddress),
      status: accountState.status,
      embeddedWalletInfo:
        authConnector && activeConnectorId === ConstantsUtil.CONNECTOR_ID.AUTH
          ? {
              user: accountState.user
                ? {
                    ...accountState.user,
                    /*
                     * Getting the username from the chain controller works well for social logins,
                     * but Farcaster uses a different connection flow and doesn't emit the username via events.
                     * Since the username is stored in local storage before the chain controller updates,
                     * it's safe to use the local storage value here.
                     */
                    username: StorageUtil.getConnectedSocialUsername()
                  }
                : undefined,
              authProvider:
                accountState.socialProvider ||
                ('email' as AccountControllerState['socialProvider'] | 'email'),
              accountType: getPreferredAccountType(namespace),
              isSmartAccountDeployed: Boolean(accountState.smartAccountDeployed)
            }
          : undefined
    }
  }

  public subscribeAccount(
    callback: (newState: UseAppKitAccountReturn) => void,
    namespace?: ChainNamespace
  ) {
    const updateVal = () => {
      const account = this.getAccount(namespace)

      if (!account) {
        return
      }

      callback(account)
    }

    if (namespace) {
      ChainController.subscribeChainProp('accountState', updateVal, namespace)
    } else {
      ChainController.subscribe(updateVal)
    }
    ConnectorController.subscribe(updateVal)
  }

  public subscribeNetwork(
    callback: (newState: Omit<UseAppKitNetworkReturn, 'switchNetwork'>) => void
  ) {
    return ChainController.subscribe(({ activeCaipNetwork }) => {
      callback({
        caipNetwork: activeCaipNetwork,
        chainId: activeCaipNetwork?.id,
        caipNetworkId: activeCaipNetwork?.caipNetworkId
      })
    })
  }

  public subscribeWalletInfo(
    callback: (newState?: ConnectedWalletInfo) => void,
    namespace?: ChainNamespace
  ) {
    if (namespace) {
      return AccountController.subscribeKey('connectedWalletInfo', callback, namespace)
    }

    return AccountController.subscribeKey('connectedWalletInfo', callback)
  }

  public subscribeShouldUpdateToAddress(callback: (newState?: string) => void) {
    AccountController.subscribeKey('shouldUpdateToAddress', callback)
  }

  public subscribeCaipNetworkChange(callback: (newState?: CaipNetwork) => void) {
    ChainController.subscribeKey('activeCaipNetwork', callback)
  }

  public getState() {
    return PublicStateController.state
  }

  public getRemoteFeatures() {
    return OptionsController.state.remoteFeatures
  }

  public subscribeState(callback: (newState: PublicStateControllerState) => void) {
    return PublicStateController.subscribe(callback)
  }

  public subscribeRemoteFeatures(callback: (newState: RemoteFeatures | undefined) => void) {
    return OptionsController.subscribeKey('remoteFeatures', callback)
  }

  public showErrorMessage(message: string) {
    SnackController.showError(message)
  }

  public showSuccessMessage(message: string) {
    SnackController.showSuccess(message)
  }

  public getEvent() {
    return { ...EventsController.state }
  }

  public subscribeEvents(callback: (newEvent: EventsControllerState) => void) {
    return EventsController.subscribe(callback)
  }

  public replace(route: RouterControllerState['view']) {
    RouterController.replace(route)
  }

  public redirect(route: RouterControllerState['view']) {
    RouterController.push(route)
  }

  public popTransactionStack(status: 'cancel' | 'error' | 'success') {
    RouterController.popTransactionStack(status)
  }

  public isOpen() {
    return ModalController.state.open
  }

  public isTransactionStackEmpty() {
    return RouterController.state.transactionStack.length === 0
  }

  public static getInstance() {
    return this.instance
  }

  public getIsConnectedState = () => Boolean(ChainController.state.activeCaipAddress)

  public addAddressLabel: (typeof AccountController)['addAddressLabel'] = (
    address,
    label,
    chain
  ) => {
    AccountController.addAddressLabel(address, label, chain)
  }

  public removeAddressLabel: (typeof AccountController)['removeAddressLabel'] = (
    address,
    chain
  ) => {
    AccountController.removeAddressLabel(address, chain)
  }

  public getAddress = (chainNamespace?: ChainNamespace) => {
    if (ChainController.state.activeChain === chainNamespace || !chainNamespace) {
      return AccountController.state.address
    }

    return ChainController.getAccountProp('address', chainNamespace)
  }

  public setApprovedCaipNetworksData: (typeof ChainController)['setApprovedCaipNetworksData'] =
    namespace => ChainController.setApprovedCaipNetworksData(namespace)

  public resetNetwork: (typeof ChainController)['resetNetwork'] = (namespace: ChainNamespace) => {
    ChainController.resetNetwork(namespace)
  }

  public addConnector: (typeof ConnectorController)['addConnector'] = connector => {
    ConnectorController.addConnector(connector)
  }

  public resetWcConnection: (typeof ConnectionController)['resetWcConnection'] = () => {
    ConnectionController.resetWcConnection()
  }

  public setAddressExplorerUrl: (typeof AccountController)['setAddressExplorerUrl'] = (
    addressExplorerUrl,
    chain
  ) => {
    AccountController.setAddressExplorerUrl(addressExplorerUrl, chain)
  }

  public setSmartAccountDeployed: (typeof AccountController)['setSmartAccountDeployed'] = (
    isDeployed,
    chain
  ) => {
    AccountController.setSmartAccountDeployed(isDeployed, chain)
  }

  public setPreferredAccountType: (typeof AccountController)['setPreferredAccountType'] = (
    preferredAccountType,
    chain
  ) => {
    ChainController.setAccountProp('preferredAccountType', preferredAccountType, chain)
  }

  public setEIP6963Enabled: (typeof OptionsController)['setEIP6963Enabled'] = enabled => {
    OptionsController.setEIP6963Enabled(enabled)
  }

  public handleUnsafeRPCRequest = () => {
    if (this.isOpen()) {
      // If we are on the modal but there is no transaction stack, close the modal
      if (this.isTransactionStackEmpty()) {
        return
      }

      // Check if we need to replace or redirect
      this.redirect('ApproveTransaction')
    } else {
      // If called from outside the modal, open ApproveTransaction
      this.open({ view: 'ApproveTransaction' })
    }
  }

  public updateFeatures(newFeatures: Partial<Features>) {
    OptionsController.setFeatures(newFeatures)
  }

  public updateRemoteFeatures(newRemoteFeatures: Partial<RemoteFeatures>) {
    OptionsController.setRemoteFeatures(newRemoteFeatures)
  }

  public updateOptions(newOptions: Partial<OptionsControllerState>) {
    const currentOptions = OptionsController.state || {}
    const updatedOptions = { ...currentOptions, ...newOptions }
    OptionsController.setOptions(updatedOptions)
  }

  public setConnectMethodsOrder(connectMethodsOrder: ConnectMethod[]) {
    OptionsController.setConnectMethodsOrder(connectMethodsOrder)
  }

  public setWalletFeaturesOrder(walletFeaturesOrder: WalletFeature[]) {
    OptionsController.setWalletFeaturesOrder(walletFeaturesOrder)
  }

  public setCollapseWallets(collapseWallets: boolean) {
    OptionsController.setCollapseWallets(collapseWallets)
  }

  public setSocialsOrder(socialsOrder: SocialProvider[]) {
    OptionsController.setSocialsOrder(socialsOrder)
  }

  public getConnectMethodsOrder() {
    return WalletUtil.getConnectOrderMethod(
      OptionsController.state.features,
      ConnectorController.getConnectors()
    )
  }

  /**
   * Adds a network to an existing adapter in AppKit.
   * @param namespace - The chain namespace to add the network to (e.g. 'eip155', 'solana')
   * @param network - The network configuration to add
   * @throws Error if adapter for namespace doesn't exist
   */
  public addNetwork(namespace: ChainNamespace, network: AppKitNetwork) {
    if (this.chainAdapters && !this.chainAdapters[namespace]) {
      throw new Error(`Adapter for namespace ${namespace} doesn't exist`)
    }

    const extendedNetwork = this.extendCaipNetwork(network, this.options)

    if (!this.getCaipNetworks().find(n => n.id === extendedNetwork.id)) {
      ChainController.addNetwork(extendedNetwork)
    }
  }

  /**
   * Removes a network from an existing adapter in AppKit.
   * @param namespace - The chain namespace the network belongs to
   * @param networkId - The network ID to remove
   * @throws Error if adapter for namespace doesn't exist or if removing last network
   */
  public removeNetwork(namespace: ChainNamespace, networkId: string | number) {
    if (this.chainAdapters && !this.chainAdapters[namespace]) {
      throw new Error(`Adapter for namespace ${namespace} doesn't exist`)
    }

    const networkToRemove = this.getCaipNetworks().find(n => n.id === networkId)

    if (!networkToRemove) {
      return
    }

    ChainController.removeNetwork(namespace, networkId)
  }
}
