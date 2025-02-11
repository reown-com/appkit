/* eslint-disable max-depth */
import type { SessionTypes } from '@walletconnect/types'
import UniversalProvider from '@walletconnect/universal-provider'
import type { UniversalProviderOpts } from '@walletconnect/universal-provider'

import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil,
  NetworkUtil,
  ParseUtil,
  getW3mThemeVariables
} from '@reown/appkit-common'
import {
  type ChainAdapter,
  type ConnectMethod,
  type ConnectedWalletInfo,
  type ConnectionControllerClient,
  type ConnectionStatus,
  type ConnectorType,
  ConstantsUtil as CoreConstantsUtil,
  type EstimateGasTransactionArgs,
  type EventsControllerState,
  type Features,
  type Metadata,
  type ModalControllerState,
  type NetworkControllerClient,
  type OptionsControllerState,
  type PublicStateControllerState,
  type RouterControllerState,
  type SdkVersion,
  type SendTransactionArgs,
  type SocialProvider,
  type ThemeControllerState,
  type UseAppKitAccountReturn,
  type UseAppKitNetworkReturn,
  type WalletFeature,
  type WriteContractArgs
} from '@reown/appkit-core'
import {
  AccountController,
  AlertController,
  ApiController,
  AssetUtil,
  BlockchainApiController,
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EnsController,
  EventsController,
  ModalController,
  OptionsController,
  PublicStateController,
  RouterController,
  SnackController,
  StorageUtil,
  ThemeController
} from '@reown/appkit-core'
import { WalletUtil } from '@reown/appkit-scaffold-ui/utils'
import { setColorTheme, setThemeVariables } from '@reown/appkit-ui'
import {
  CaipNetworksUtil,
  ErrorUtil,
  HelpersUtil,
  LoggerUtil,
  ConstantsUtil as UtilConstantsUtil
} from '@reown/appkit-utils'
import {
  W3mFrameHelpers,
  W3mFrameProvider,
  W3mFrameRpcConstants,
  type W3mFrameTypes
} from '@reown/appkit-wallet'
import type { AppKitNetwork } from '@reown/appkit/networks'

import type { AdapterBlueprint } from './adapters/ChainAdapterBlueprint.js'
import { W3mFrameProviderSingleton } from './auth-provider/W3MFrameProviderSingleton.js'
import { type ProviderStoreUtilState, ProviderUtil } from './store/ProviderUtil.js'
import {
  UniversalAdapter,
  UniversalAdapter as UniversalAdapterClient
} from './universal-adapter/client.js'
import { WcHelpersUtil } from './utils/HelpersUtil.js'
import type { AppKitOptions } from './utils/TypesUtil.js'

declare global {
  interface Window {
    ethereum?: Record<string, unknown>
  }
}

// -- Export Controllers -------------------------------------------------------
export { AccountController }

// -- Types --------------------------------------------------------------------
export interface OpenOptions {
  view:
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
  uri?: string
  namespace?: ChainNamespace
}

type Adapters = Record<ChainNamespace, AdapterBlueprint>

interface AppKitOptionsWithSdk extends AppKitOptions {
  sdkVersion: SdkVersion
}

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

// -- Client --------------------------------------------------------------------
export class AppKit {
  private static instance?: AppKit

  public activeAdapter?: AdapterBlueprint

  public options: AppKitOptions

  public adapters?: ChainAdapter[]

  public activeChainNamespace?: ChainNamespace

  public chainNamespaces: ChainNamespace[] = []

  public chainAdapters?: Adapters

  public universalAdapter?: UniversalAdapterClient

  private universalProvider?: UniversalProvider

  private connectionControllerClient?: ConnectionControllerClient

  private networkControllerClient?: NetworkControllerClient

  private universalProviderInitPromise?: Promise<void>

  private authProvider?: W3mFrameProvider

  private initPromise?: Promise<void> = undefined

  public version: SdkVersion

  public adapter?: ChainAdapter

  public reportedAlertErrors: Record<string, boolean> = {}

  private caipNetworks?: [CaipNetwork, ...CaipNetwork[]]

  private defaultCaipNetwork?: CaipNetwork

  public constructor(options: AppKitOptionsWithSdk) {
    this.options = options
    this.version = options.sdkVersion
    this.caipNetworks = this.extendCaipNetworks(options)
    this.chainNamespaces = [
      ...new Set(this.caipNetworks?.map(caipNetwork => caipNetwork.chainNamespace))
    ]
    this.defaultCaipNetwork = this.extendDefaultCaipNetwork(options)
    this.chainAdapters = this.createAdapters(options.adapters as AdapterBlueprint[])
    this.initialize(options)
    this.sendInitializeEvent(options)
  }

  public static getInstance() {
    return this.instance
  }

  private async initialize(options: AppKitOptionsWithSdk) {
    this.initControllers(options)
    await this.initChainAdapters()
    await this.injectModalUi()
    await this.syncExistingConnection()

    PublicStateController.set({ initialized: true })
  }

  private sendInitializeEvent(options: AppKitOptionsWithSdk) {
    const { ...optionsCopy } = options
    delete optionsCopy.adapters

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

  // -- Public -------------------------------------------------------------------
  public async open(options?: OpenOptions) {
    await this.injectModalUi()
    if (options?.uri && this.universalProvider) {
      ConnectionController.setUri(options.uri)
    }

    if (options?.namespace) {
      ConnectorController.setFilterByNamespace(options.namespace)
    }

    await ModalController.open(options)
  }

  public async close() {
    await this.injectModalUi()
    ModalController.close()
  }

  public setLoading(loading: ModalControllerState['loading']) {
    ModalController.setLoading(loading)
  }

  // -- Adapter Methods ----------------------------------------------------------
  public getError() {
    return ''
  }

  public getChainId() {
    return ChainController.state.activeCaipNetwork?.id
  }

  public switchNetwork(appKitNetwork: AppKitNetwork) {
    const network = this.caipNetworks?.find(n => n.id === appKitNetwork.id)

    if (!network) {
      AlertController.open(ErrorUtil.ALERT_ERRORS.SWITCH_NETWORK_NOT_FOUND, 'error')

      return
    }

    ChainController.switchActiveNetwork(network)
  }

  public getWalletProvider() {
    return ChainController.state.activeChain
      ? ProviderUtil.state.providers[ChainController.state.activeChain]
      : null
  }

  public getWalletProviderType() {
    return ChainController.state.activeChain
      ? ProviderUtil.state.providerIds[ChainController.state.activeChain]
      : null
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

  public getWalletInfo() {
    return AccountController.state.connectedWalletInfo
  }

  public subscribeAccount(
    callback: (newState: UseAppKitAccountReturn) => void,
    namespace?: ChainNamespace
  ) {
    function updateVal() {
      const authConnector = ConnectorController.getAuthConnector(namespace)
      const accountState = ChainController.getAccountDataByChainNamespace(namespace)

      if (!accountState) {
        return
      }

      callback({
        allAccounts: accountState.allAccounts,
        caipAddress: accountState.caipAddress,
        address: CoreHelperUtil.getPlainAddress(accountState.caipAddress),
        isConnected: Boolean(accountState.caipAddress),
        status: accountState.status,
        embeddedWalletInfo: authConnector
          ? {
              user: accountState.user,
              authProvider: accountState.socialProvider || 'email',
              accountType: accountState.preferredAccountType,
              isSmartAccountDeployed: Boolean(accountState.smartAccountDeployed)
            }
          : undefined
      })
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

  public subscribeWalletInfo(callback: (newState?: ConnectedWalletInfo) => void) {
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

  public subscribeState(callback: (newState: PublicStateControllerState) => void) {
    return PublicStateController.subscribe(callback)
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

  public popTransactionStack(cancel?: boolean) {
    RouterController.popTransactionStack(cancel)
  }

  public isOpen() {
    return ModalController.state.open
  }

  public isTransactionStackEmpty() {
    return RouterController.state.transactionStack.length === 0
  }

  public setStatus: (typeof AccountController)['setStatus'] = (status, chain) => {
    StorageUtil.setConnectionStatus(status as ConnectionStatus)
    AccountController.setStatus(status, chain)
  }

  public getIsConnectedState = () => Boolean(ChainController.state.activeCaipAddress)

  public setAllAccounts: (typeof AccountController)['setAllAccounts'] = (addresses, chain) => {
    AccountController.setAllAccounts<typeof chain>(addresses, chain)
    OptionsController.setHasMultipleAddresses(addresses?.length > 1)
  }

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

  public getCaipAddress = (chainNamespace?: ChainNamespace) => {
    if (ChainController.state.activeChain === chainNamespace || !chainNamespace) {
      return ChainController.state.activeCaipAddress
    }

    return ChainController.getAccountProp('caipAddress', chainNamespace)
  }

  public getAddressByChainNamespace = (chainNamespace: ChainNamespace) =>
    ChainController.getAccountProp('address', chainNamespace)

  public getAddress = (chainNamespace?: ChainNamespace) => {
    if (ChainController.state.activeChain === chainNamespace || !chainNamespace) {
      return AccountController.state.address
    }

    return ChainController.getAccountProp('address', chainNamespace)
  }

  public getProvider = <T>(namespace: ChainNamespace) => ProviderUtil.getProvider<T>(namespace)

  public getProviderType = (namespace: ChainNamespace) => ProviderUtil.state.providerIds[namespace]

  public getPreferredAccountType = () =>
    AccountController.state.preferredAccountType as W3mFrameTypes.AccountType

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
    if (OptionsController.state.enableEmbedded) {
      ModalController.close()
    }
  }

  public resetAccount: (typeof AccountController)['resetAccount'] = (chain: ChainNamespace) => {
    AccountController.resetAccount(chain)
  }

  public setCaipNetwork: (typeof ChainController)['setActiveCaipNetwork'] = caipNetwork => {
    ChainController.setActiveCaipNetwork(caipNetwork)
  }

  public getCaipNetwork = (chainNamespace?: ChainNamespace) => {
    if (chainNamespace) {
      return ChainController.getRequestedCaipNetworks(chainNamespace).filter(
        c => c.chainNamespace === chainNamespace
      )?.[0]
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

  public getCaipNetworks = (namespace: ChainNamespace) =>
    ChainController.getRequestedCaipNetworks(namespace)

  public getActiveChainNamespace = () => ChainController.state.activeChain

  public setRequestedCaipNetworks: (typeof ChainController)['setRequestedCaipNetworks'] = (
    requestedCaipNetworks,
    chain: ChainNamespace
  ) => {
    ChainController.setRequestedCaipNetworks(requestedCaipNetworks, chain)
  }

  public getApprovedCaipNetworkIds: (typeof ChainController)['getAllApprovedCaipNetworkIds'] = () =>
    ChainController.getAllApprovedCaipNetworkIds()

  public setApprovedCaipNetworksData: (typeof ChainController)['setApprovedCaipNetworksData'] =
    namespace => ChainController.setApprovedCaipNetworksData(namespace)

  public resetNetwork: (typeof ChainController)['resetNetwork'] = (namespace: ChainNamespace) => {
    ChainController.resetNetwork(namespace)
  }

  public setConnectors: (typeof ConnectorController)['setConnectors'] = connectors => {
    const allConnectors = [...ConnectorController.getConnectors(), ...connectors]
    ConnectorController.setConnectors(allConnectors)
  }

  public addConnector: (typeof ConnectorController)['addConnector'] = connector => {
    ConnectorController.addConnector(connector)
  }

  public getConnectors: (typeof ConnectorController)['getConnectors'] = () =>
    ConnectorController.getConnectors()

  public resetWcConnection: (typeof ConnectionController)['resetWcConnection'] = () => {
    ConnectionController.resetWcConnection()
  }

  public fetchIdentity: (typeof BlockchainApiController)['fetchIdentity'] = request =>
    BlockchainApiController.fetchIdentity(request)

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

  public setConnectedWalletInfo: (typeof AccountController)['setConnectedWalletInfo'] = (
    connectedWalletInfo,
    chain
  ) => {
    AccountController.setConnectedWalletInfo(connectedWalletInfo, chain)
  }

  public setSmartAccountEnabledNetworks: (typeof ChainController)['setSmartAccountEnabledNetworks'] =
    (smartAccountEnabledNetworks, chain) => {
      ChainController.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks, chain)
    }

  public setPreferredAccountType: (typeof AccountController)['setPreferredAccountType'] = (
    preferredAccountType,
    chain
  ) => {
    AccountController.setPreferredAccountType(preferredAccountType, chain)
  }

  public getReownName: (typeof EnsController)['getNamesForAddress'] = address =>
    EnsController.getNamesForAddress(address)

  public setEIP6963Enabled: (typeof OptionsController)['setEIP6963Enabled'] = enabled => {
    OptionsController.setEIP6963Enabled(enabled)
  }

  public setClientId: (typeof BlockchainApiController)['setClientId'] = clientId => {
    BlockchainApiController.setClientId(clientId)
  }

  public getConnectorImage: (typeof AssetUtil)['getConnectorImage'] = connector =>
    AssetUtil.getConnectorImage(connector)

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

  public async disconnect() {
    await ConnectionController.disconnect()
  }

  public getConnectMethodsOrder() {
    return WalletUtil.getConnectOrderMethod(
      OptionsController.state.features,
      ConnectorController.getConnectors()
    )
  }

  /**
   * Removes an adapter from the AppKit.
   * @param namespace - The namespace of the adapter to remove.
   */
  public removeAdapter(namespace: ChainNamespace) {
    const isConnected = this.getIsConnectedState()
    const adapter = this.getAdapter(namespace)

    if (!adapter || !this.chainAdapters || isConnected) {
      return
    }

    const newCaipNetworks = this.caipNetworks?.filter(
      network => network.chainNamespace !== namespace
    )

    ChainController.removeAdapter(namespace)
    ConnectorController.removeAdapter(namespace)
    this.chainNamespaces = this.chainNamespaces.filter(n => n !== namespace)
    this.caipNetworks = newCaipNetworks as [CaipNetwork, ...CaipNetwork[]]
    adapter.removeAllEventListeners()
    Reflect.deleteProperty(this.chainAdapters, namespace)
  }

  /**
   * Adds an adapter to the AppKit.
   * @param adapter - The adapter instance.
   * @param networks - The list of networks that this adapter supports / uses.
   */
  public addAdapter(adapter: ChainAdapter, networks: [AppKitNetwork, ...AppKitNetwork[]]) {
    const namespace = adapter.namespace

    if (!this.connectionControllerClient || !this.networkControllerClient) {
      return
    }

    if (!this.chainAdapters || !namespace) {
      return
    }

    const extendedAdapterNetworks = this.extendCaipNetworks({ ...this.options, networks })
    this.caipNetworks = [...(this.caipNetworks || []), ...extendedAdapterNetworks]

    this.createAdapter(adapter as unknown as AdapterBlueprint)
    this.initChainAdapter(namespace)

    ChainController.addAdapter(
      adapter,
      {
        connectionControllerClient: this.connectionControllerClient,
        networkControllerClient: this.networkControllerClient
      },
      extendedAdapterNetworks
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

    if (this.caipNetworks && !this.caipNetworks?.find(n => n.id === extendedNetwork.id)) {
      this.caipNetworks.push(extendedNetwork)
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

    const networkToRemove = this.caipNetworks?.find(n => n.id === networkId)

    if (!networkToRemove) {
      throw new Error(`Network with ID ${networkId} not found`)
    }

    if (!this.caipNetworks) {
      return
    }

    const remainingAllNetworks = this.caipNetworks.filter(n => n.id !== networkId)
    const remainingNamespaceNetworks = this.caipNetworks.filter(
      n => n.id !== networkId && n.chainNamespace === namespace
    )

    if (!remainingNamespaceNetworks?.length) {
      throw new Error('Cannot remove last network for a namespace')
    }

    ChainController.removeNetwork(namespace, networkId)
    this.caipNetworks = [...remainingAllNetworks] as [CaipNetwork, ...CaipNetwork[]]
  }

  // -- Private ------------------------------------------------------------------
  private initializeOptionsController(options: AppKitOptionsWithSdk) {
    OptionsController.setDebug(options.debug !== false)

    if (!options.projectId) {
      AlertController.open(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED, 'error')

      return
    }

    // On by default
    OptionsController.setEnableWalletConnect(options.enableWalletConnect !== false)
    OptionsController.setEnableWalletGuide(options.enableWalletGuide !== false)
    OptionsController.setEnableWallets(options.enableWallets !== false)
    OptionsController.setEIP6963Enabled(options.enableEIP6963 !== false)

    OptionsController.setEnableAuthLogger(options.enableAuthLogger !== false)

    OptionsController.setSdkVersion(options.sdkVersion)
    OptionsController.setProjectId(options.projectId)
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
    OptionsController.setDefaultAccountTypes(options.defaultAccountTypes)

    const defaultMetaData = this.getDefaultMetaData()
    if (!options.metadata && defaultMetaData) {
      options.metadata = defaultMetaData
    }
    OptionsController.setMetadata(options.metadata)
    OptionsController.setDisableAppend(options.disableAppend)
    OptionsController.setEnableEmbedded(options.enableEmbedded)
    OptionsController.setSIWX(options.siwx)

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

  private initializeThemeController(options: AppKitOptions) {
    if (options.themeMode) {
      ThemeController.setThemeMode(options.themeMode)
    }

    if (options.themeVariables) {
      ThemeController.setThemeVariables(options.themeVariables)
    }
  }

  private initializeChainController(options: AppKitOptions) {
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

  private async initializeBlockchainApiController(options: AppKitOptions) {
    await BlockchainApiController.getSupportedNetworks({
      projectId: options.projectId
    })
  }

  private initControllers(options: AppKitOptionsWithSdk) {
    this.initializeOptionsController(options)
    this.initializeChainController(options)
    this.initializeThemeController(options)
    this.initializeBlockchainApiController(options)

    if (options.excludeWalletIds) {
      ApiController.initializeExcludedWalletRdns({ ids: options.excludeWalletIds })
    }
  }

  private getDefaultMetaData() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
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

  private setUnsupportedNetwork(chainId: string | number) {
    const namespace = this.getActiveChainNamespace()

    if (namespace) {
      const unsupportedNetwork = this.getUnsupportedNetwork(`${namespace}:${chainId}`)
      ChainController.setActiveCaipNetwork(unsupportedNetwork)
    }
  }

  private extendCaipNetwork(network: AppKitNetwork, options: AppKitOptions) {
    const extendedNetwork = CaipNetworksUtil.extendCaipNetwork(network, {
      customNetworkImageUrls: options.chainImages,
      projectId: options.projectId
    })

    return extendedNetwork
  }

  private extendCaipNetworks(options: AppKitOptions) {
    const extendedNetworks = CaipNetworksUtil.extendCaipNetworks(options.networks, {
      customNetworkImageUrls: options.chainImages,
      projectId: options.projectId
    })

    return extendedNetworks
  }

  private extendDefaultCaipNetwork(options: AppKitOptions) {
    const defaultNetwork = options.networks.find(n => n.id === options.defaultNetwork?.id)
    const extendedNetwork = defaultNetwork
      ? CaipNetworksUtil.extendCaipNetwork(defaultNetwork, {
          customNetworkImageUrls: options.chainImages,
          projectId: options.projectId
        })
      : undefined

    return extendedNetwork
  }

  private createClients() {
    this.connectionControllerClient = {
      connectWalletConnect: async () => {
        const adapter = this.getAdapter(ChainController.state.activeChain)

        if (!adapter) {
          throw new Error('Adapter not found')
        }

        const result = await adapter.connectWalletConnect(this.getCaipNetwork()?.id)
        this.close()

        this.setClientId(result?.clientId || null)
        StorageUtil.setConnectedNamespaces([...ChainController.state.chains.keys()])
        await this.syncWalletConnectAccount()
      },
      connectExternal: async ({ id, info, type, provider, chain, caipNetwork }) => {
        const activeChain = ChainController.state.activeChain as ChainNamespace
        const chainToUse = chain || activeChain
        const adapter = this.getAdapter(chainToUse)

        if (chain && chain !== activeChain && !caipNetwork) {
          const toConnectNetwork = this.caipNetworks?.find(
            network => network.chainNamespace === chain
          )
          if (toConnectNetwork) {
            this.setCaipNetwork(toConnectNetwork)
          }
        }

        if (!adapter) {
          throw new Error('Adapter not found')
        }

        const res = await adapter.connect({
          id,
          info,
          type,
          provider,
          chainId: caipNetwork?.id || this.getCaipNetwork()?.id,
          rpcUrl:
            caipNetwork?.rpcUrls?.default?.http?.[0] ||
            this.getCaipNetwork()?.rpcUrls?.default?.http?.[0]
        })

        if (!res) {
          return
        }

        StorageUtil.addConnectedNamespace(chainToUse)
        this.syncProvider({ ...res, chainNamespace: chainToUse })
        await this.syncAccount({ ...res, chainNamespace: chainToUse })
        const { accounts } = await adapter.getAccounts({ namespace: chainToUse, id })
        this.setAllAccounts(accounts, chainToUse)
      },
      reconnectExternal: async ({ id, info, type, provider }) => {
        const namespace = ChainController.state.activeChain as ChainNamespace
        const adapter = this.getAdapter(namespace)
        if (adapter?.reconnect) {
          await adapter?.reconnect({ id, info, type, provider, chainId: this.getCaipNetwork()?.id })
          StorageUtil.addConnectedNamespace(namespace)
        }
      },
      disconnect: async () => {
        const namespace = ChainController.state.activeChain as ChainNamespace
        const adapter = this.getAdapter(namespace)
        const provider = ProviderUtil.getProvider(namespace)
        const providerType = ProviderUtil.state.providerIds[namespace]

        await adapter?.disconnect({ provider, providerType })

        StorageUtil.removeConnectedNamespace(namespace)
        ProviderUtil.resetChain(namespace)
        this.setUser(undefined, namespace)
        this.setStatus('disconnected', namespace)
      },
      checkInstalled: (ids?: string[]) => {
        if (!ids) {
          return Boolean(window.ethereum)
        }

        return ids.some(id => Boolean(window.ethereum?.[String(id)]))
      },
      signMessage: async (message: string) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const result = await adapter?.signMessage({
          message,
          address: AccountController.state.address as string,
          provider: ProviderUtil.getProvider(ChainController.state.activeChain as ChainNamespace)
        })

        return result?.signature || ''
      },
      sendTransaction: async (args: SendTransactionArgs) => {
        if (args.chainNamespace === ConstantsUtil.CHAIN.EVM) {
          const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

          const provider = ProviderUtil.getProvider(
            ChainController.state.activeChain as ChainNamespace
          )
          const result = await adapter?.sendTransaction({ ...args, provider })

          return result?.hash || ''
        }

        return ''
      },
      estimateGas: async (args: EstimateGasTransactionArgs) => {
        if (args.chainNamespace === ConstantsUtil.CHAIN.EVM) {
          const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
          const provider = ProviderUtil.getProvider(
            ChainController.state.activeChain as ChainNamespace
          )
          const caipNetwork = this.getCaipNetwork()
          if (!caipNetwork) {
            throw new Error('CaipNetwork is undefined')
          }

          const result = await adapter?.estimateGas({
            ...args,
            provider,
            caipNetwork
          })

          return result?.gas || 0n
        }

        return 0n
      },
      getEnsAvatar: async () => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const result = await adapter?.getProfile({
          address: AccountController.state.address as string,
          chainId: Number(this.getCaipNetwork()?.id)
        })

        return result?.profileImage || false
      },
      getEnsAddress: async (name: string) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const caipNetwork = this.getCaipNetwork()
        if (!caipNetwork) {
          return false
        }
        const result = await adapter?.getEnsAddress({
          name,
          caipNetwork
        })

        return result?.address || false
      },
      writeContract: async (args: WriteContractArgs) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
        const caipNetwork = this.getCaipNetwork()
        const caipAddress = this.getCaipAddress()
        const provider = ProviderUtil.getProvider(
          ChainController.state.activeChain as ChainNamespace
        )
        if (!caipNetwork || !caipAddress) {
          throw new Error('CaipNetwork or CaipAddress is undefined')
        }

        const result = await adapter?.writeContract({ ...args, caipNetwork, provider, caipAddress })

        return result?.hash as `0x${string}` | null
      },
      parseUnits: (value: string, decimals: number) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        return adapter?.parseUnits({ value, decimals }) ?? 0n
      },
      formatUnits: (value: bigint, decimals: number) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        return adapter?.formatUnits({ value, decimals }) ?? '0'
      },
      getCapabilities: async (params: AdapterBlueprint.GetCapabilitiesParams) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        await adapter?.getCapabilities(params)
      },
      grantPermissions: async (params: AdapterBlueprint.GrantPermissionsParams) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        return await adapter?.grantPermissions(params)
      },
      revokePermissions: async (params: AdapterBlueprint.RevokePermissionsParams) => {
        const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

        if (adapter?.revokePermissions) {
          return await adapter.revokePermissions(params)
        }

        return '0x'
      }
    }

    this.networkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        if (!caipNetwork) {
          return
        }
        if (
          AccountController.state.address &&
          caipNetwork.chainNamespace === ChainController.state.activeChain
        ) {
          const adapter = this.getAdapter(ChainController.state.activeChain)
          const provider = ProviderUtil.getProvider(ChainController.state.activeChain)
          const providerType = ProviderUtil.state.providerIds[ChainController.state.activeChain]

          await adapter?.switchNetwork({ caipNetwork, provider, providerType })
          this.setCaipNetwork(caipNetwork)
          await this.syncAccount({
            address: AccountController.state.address,
            chainId: caipNetwork.id,
            chainNamespace: caipNetwork.chainNamespace
          })
        } else if (AccountController.state.address) {
          const providerType =
            ProviderUtil.state.providerIds[ChainController.state.activeChain as ChainNamespace]

          if (providerType === UtilConstantsUtil.CONNECTOR_TYPE_AUTH) {
            try {
              ChainController.state.activeChain = caipNetwork.chainNamespace
              await this.connectionControllerClient?.connectExternal?.({
                id: ConstantsUtil.CONNECTOR_ID.AUTH,
                provider: this.authProvider,
                chain: caipNetwork.chainNamespace,
                chainId: caipNetwork.id,
                type: UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType,
                caipNetwork
              })
              this.setCaipNetwork(caipNetwork)
            } catch (error) {
              const adapter = this.getAdapter(caipNetwork.chainNamespace as ChainNamespace)
              await adapter?.switchNetwork({
                caipNetwork,
                provider: this.authProvider,
                providerType
              })
            }
          } else if (providerType === 'WALLET_CONNECT') {
            this.setCaipNetwork(caipNetwork)
            this.syncWalletConnectAccount()
          } else {
            this.setCaipNetwork(caipNetwork)
            const address = this.getAddressByChainNamespace(caipNetwork.chainNamespace)
            if (address) {
              this.syncAccount({
                address,
                chainId: caipNetwork.id,
                chainNamespace: caipNetwork.chainNamespace
              })
            }
          }
        } else {
          this.setCaipNetwork(caipNetwork)
        }
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      getApprovedCaipNetworksData: async () => {
        const providerType =
          ProviderUtil.state.providerIds[ChainController.state.activeChain as ChainNamespace]

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
    }

    ConnectionController.setClient(this.connectionControllerClient)
  }

  private setupAuthConnectorListeners(provider: W3mFrameProvider) {
    provider.onRpcRequest((request: W3mFrameTypes.RPCRequest) => {
      if (W3mFrameHelpers.checkIfRequestExists(request)) {
        if (!W3mFrameHelpers.checkIfRequestIsSafe(request)) {
          this.handleUnsafeRPCRequest()
        }
      } else {
        this.open()
        // eslint-disable-next-line no-console
        console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, {
          method: request.method
        })
        setTimeout(() => {
          this.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE)
        }, 300)
        provider.rejectRpcRequests()
      }
    })
    provider.onRpcError(() => {
      const isModalOpen = this.isOpen()
      if (isModalOpen) {
        if (this.isTransactionStackEmpty()) {
          this.close()
        } else {
          this.popTransactionStack(true)
        }
      }
    })
    provider.onRpcSuccess((_, request) => {
      const isSafeRequest = W3mFrameHelpers.checkIfRequestIsSafe(request)
      if (isSafeRequest) {
        return
      }
      if (AccountController.state.address && ChainController.state.activeCaipNetwork?.id) {
        this.updateNativeBalance()
      }
      if (this.isTransactionStackEmpty()) {
        this.close()
      } else {
        this.popTransactionStack()
      }
    })
    provider.onNotConnected(() => {
      const namespace = ChainController.state.activeChain as ChainNamespace
      const connectorId = StorageUtil.getConnectedConnectorId(namespace)
      const isConnectedWithAuth = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH
      if (isConnectedWithAuth) {
        this.setCaipAddress(undefined, namespace)
        this.setLoading(false)
      }
    })
    provider.onConnect(async user => {
      const namespace = ChainController.state.activeChain as ChainNamespace

      // To keep backwards compatibility, eip155 chainIds are numbers and not actual caipChainIds
      const caipAddress =
        namespace === ConstantsUtil.CHAIN.EVM
          ? (`eip155:${user.chainId}:${user.address}` as CaipAddress)
          : (`${user.chainId}:${user.address}` as CaipAddress)
      this.setSmartAccountDeployed(Boolean(user.smartAccountDeployed), namespace)

      if (!HelpersUtil.isLowerCaseMatch(user.address, AccountController.state.address)) {
        this.syncIdentity({
          address: user.address,
          chainId: user.chainId,
          chainNamespace: namespace
        })
      }

      this.setCaipAddress(caipAddress, namespace)
      this.setUser({ ...(AccountController.state.user || {}), email: user.email }, namespace)

      const preferredAccountType = (user.preferredAccountType ||
        OptionsController.state.defaultAccountTypes[namespace]) as W3mFrameTypes.AccountType
      this.setPreferredAccountType(preferredAccountType, namespace)

      const userAccounts = user.accounts?.map(account =>
        CoreHelperUtil.createAccount(
          namespace,
          account.address,
          account.type || OptionsController.state.defaultAccountTypes[namespace]
        )
      )

      this.setAllAccounts(
        userAccounts || [
          CoreHelperUtil.createAccount(namespace, user.address, preferredAccountType)
        ],
        namespace
      )

      await provider.getSmartAccountEnabledNetworks()
      this.setLoading(false)
    })
    provider.onSocialConnected(({ userName }) => {
      this.setUser(
        { ...(AccountController.state.user || {}), username: userName },
        ChainController.state.activeChain
      )
    })
    provider.onGetSmartAccountEnabledNetworks(networks => {
      this.setSmartAccountEnabledNetworks(
        networks,
        ChainController.state.activeChain as ChainNamespace
      )
    })
    provider.onSetPreferredAccount(({ address, type }) => {
      if (!address) {
        return
      }
      this.setPreferredAccountType(
        type as W3mFrameTypes.AccountType,
        ChainController.state.activeChain as ChainNamespace
      )
    })
  }

  private async syncAuthConnector(provider: W3mFrameProvider) {
    this.setLoading(true)
    const isLoginEmailUsed = provider.getLoginEmailUsed()
    this.setLoading(isLoginEmailUsed)

    if (isLoginEmailUsed) {
      this.setStatus('connecting', ChainController.state.activeChain as ChainNamespace)
    }

    const email = provider.getEmail()
    const username = provider.getUsername()

    this.setUser(
      { ...(AccountController.state?.user || {}), username, email },
      ChainController.state.activeChain
    )

    this.setupAuthConnectorListeners(provider)

    const { isConnected } = await provider.isConnected()

    const theme = ThemeController.getSnapshot()
    const options = OptionsController.getSnapshot()

    provider.syncDappData({
      metadata: options.metadata as Metadata,
      sdkVersion: options.sdkVersion,
      projectId: options.projectId,
      sdkType: options.sdkType
    })
    provider.syncTheme({
      themeMode: theme.themeMode,
      themeVariables: theme.themeVariables,
      w3mThemeVariables: getW3mThemeVariables(theme.themeVariables, theme.themeMode)
    })

    const namespace = StorageUtil.getActiveNamespace()

    if (namespace) {
      if (isConnected && this.connectionControllerClient?.connectExternal) {
        await this.connectionControllerClient?.connectExternal({
          id: ConstantsUtil.CONNECTOR_ID.AUTH,
          info: { name: ConstantsUtil.CONNECTOR_ID.AUTH },
          type: UtilConstantsUtil.CONNECTOR_TYPE_AUTH as ConnectorType,
          provider,
          chainId: ChainController.state.activeCaipNetwork?.id,
          chain: namespace
        })
        this.setStatus('connected', namespace)
      } else if (
        StorageUtil.getConnectedConnectorId(namespace) === ConstantsUtil.CONNECTOR_ID.AUTH
      ) {
        this.setStatus('disconnected', namespace)
        StorageUtil.removeConnectedNamespace(namespace)
      }
    }

    this.setLoading(false)
  }

  private listenWalletConnect() {
    if (this.universalProvider) {
      this.universalProvider.on('display_uri', (uri: string) => {
        ConnectionController.setUri(uri)
      })

      this.universalProvider.on('disconnect', () => {
        this.chainNamespaces.forEach(namespace => {
          this.resetAccount(namespace)
        })
        ConnectionController.resetWcConnection()
      })

      this.universalProvider.on('chainChanged', (chainId: number | string) => {
        // eslint-disable-next-line eqeqeq
        const caipNetwork = this.caipNetworks?.find(c => c.id == chainId)
        const currentCaipNetwork = this.getCaipNetwork()

        if (!caipNetwork) {
          this.setUnsupportedNetwork(chainId)

          return
        }

        if (currentCaipNetwork?.id !== caipNetwork?.id) {
          this.setCaipNetwork(caipNetwork)
        }
      })

      this.universalProvider.on('session_event', (callbackData: unknown) => {
        if (WcHelpersUtil.isSessionEventData(callbackData)) {
          const { name, data } = callbackData.params.event

          if (
            name === 'accountsChanged' &&
            Array.isArray(data) &&
            CoreHelperUtil.isCaipAddress(data[0])
          ) {
            this.syncAccount(ParseUtil.parseCaipAddress(data[0]))
          }
        }
      })
    }
  }

  private listenAdapter(chainNamespace: ChainNamespace) {
    const adapter = this.getAdapter(chainNamespace)

    if (!adapter) {
      return
    }

    const connectionStatus = StorageUtil.getConnectionStatus()

    if (connectionStatus === 'connected') {
      this.setStatus('connecting', chainNamespace)
    } else {
      this.setStatus(connectionStatus, chainNamespace)
    }

    adapter.on('switchNetwork', ({ address, chainId }) => {
      if (
        chainId &&
        this.caipNetworks?.find(n => n.id === chainId || n.caipNetworkId === chainId)
      ) {
        if (ChainController.state.activeChain === chainNamespace && address) {
          this.syncAccount({ address, chainId, chainNamespace })
        } else if (
          ChainController.state.activeChain === chainNamespace &&
          AccountController.state.address
        ) {
          this.syncAccount({
            address: AccountController.state.address,
            chainId,
            chainNamespace
          })
        }
      } else {
        this.setUnsupportedNetwork(chainId)
      }
    })

    adapter.on('disconnect', this.disconnect.bind(this))

    adapter.on('pendingTransactions', () => {
      const address = AccountController.state.address
      const activeCaipNetwork = ChainController.state.activeCaipNetwork

      if (!address || !activeCaipNetwork?.id) {
        return
      }

      this.updateNativeBalance()
    })

    adapter.on('accountChanged', ({ address, chainId }) => {
      if (ChainController.state.activeChain === chainNamespace && chainId) {
        this.syncAccount({
          address,
          chainId,
          chainNamespace
        })
      } else if (
        ChainController.state.activeChain === chainNamespace &&
        ChainController.state.activeCaipNetwork?.id
      ) {
        this.syncAccount({
          address,
          chainId: ChainController.state.activeCaipNetwork?.id,
          chainNamespace
        })
      }
    })
  }

  private async updateNativeBalance() {
    const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)
    if (adapter && ChainController.state.activeChain && AccountController.state.address) {
      const balance = await adapter.getBalance({
        address: AccountController.state.address,
        chainId: ChainController.state.activeCaipNetwork?.id as string | number,
        caipNetwork: this.getCaipNetwork(),
        tokens: this.options.tokens
      })
      this.setBalance(balance.balance, balance.symbol, ChainController.state.activeChain)
    }
  }

  private getChainsFromNamespaces(namespaces: SessionTypes.Namespaces = {}): CaipNetworkId[] {
    return Object.values(namespaces).flatMap((namespace: SessionTypes.BaseNamespace) => {
      const chains = (namespace.chains || []) as CaipNetworkId[]
      const accountsChains = namespace.accounts.map(account => {
        const { chainId, chainNamespace } = ParseUtil.parseCaipAddress(account as CaipAddress)

        return `${chainNamespace}:${chainId}`
      })

      return Array.from(new Set([...chains, ...accountsChains]))
    }) as CaipNetworkId[]
  }

  private async syncWalletConnectAccount() {
    const adapter = this.getAdapter(ChainController.state.activeChain as ChainNamespace)

    this.chainNamespaces.forEach(async chainNamespace => {
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
          (adapter as ChainAdapter)?.namespace !== ConstantsUtil.CHAIN.EVM
        ) {
          const provider = adapter?.getWalletConnectProvider({
            caipNetworks: this.caipNetworks,
            provider: this.universalProvider,
            activeCaipNetwork: ChainController.state.activeCaipNetwork
          })
          ProviderUtil.setProvider(chainNamespace, provider)
        } else {
          ProviderUtil.setProvider(chainNamespace, this.universalProvider)
        }

        StorageUtil.setConnectedConnectorId(
          chainNamespace,
          ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
        )

        StorageUtil.addConnectedNamespace(chainNamespace)

        if ((adapter as ChainAdapter)?.adapterType === 'wagmi') {
          try {
            await adapter?.connect({
              id: 'walletConnect',
              type: 'WALLET_CONNECT',
              chainId: ChainController.state.activeCaipNetwork?.id as string | number
            })
          } catch (error) {
            /**
             * Handle edge case where wagmi detects existing connection but lacks to complete UniversalProvider instance.
             * Connection attempt fails due to already connected state - reconnect to restore provider state.
             */
            if (adapter?.reconnect) {
              adapter?.reconnect({
                id: 'walletConnect',
                type: 'WALLET_CONNECT'
              })
            }
          }
        }

        this.syncWalletConnectAccounts(chainNamespace)

        await this.syncAccount({
          address,
          chainId,
          chainNamespace
        })
      }
    })

    await ChainController.setApprovedCaipNetworksData(
      ChainController.state.activeChain as ChainNamespace
    )
  }

  private syncWalletConnectAccounts(chainNamespace: ChainNamespace) {
    const addresses = this.universalProvider?.session?.namespaces?.[chainNamespace]?.accounts
      ?.map(account => {
        const { address } = ParseUtil.parseCaipAddress(account as CaipAddress)

        return address
      })
      .filter((address, index, self) => self.indexOf(address) === index) as string[]

    if (addresses) {
      this.setAllAccounts<typeof chainNamespace>(
        addresses.map(address =>
          CoreHelperUtil.createAccount(
            chainNamespace,
            address,
            chainNamespace === 'bip122' ? 'payment' : 'eoa'
          )
        ),
        chainNamespace
      )
    }
  }

  private syncProvider({
    type,
    provider,
    id,
    chainNamespace
  }: Pick<AdapterBlueprint.ConnectResult, 'type' | 'provider' | 'id'> & {
    chainNamespace: ChainNamespace
  }) {
    ProviderUtil.setProviderId(chainNamespace, type)
    ProviderUtil.setProvider(chainNamespace, provider)
    StorageUtil.setConnectedConnectorId(chainNamespace, id)
  }

  private async syncAccount(
    params: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
      chainNamespace: ChainNamespace
    }
  ) {
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
      let caipNetwork = this.caipNetworks?.find(n => n.id.toString() === chainIdToUse.toString())
      let fallbackCaipNetwork = this.caipNetworks?.find(n => n.chainNamespace === chainNamespace)

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

        caipNetwork = this.caipNetworks?.find(n => n.caipNetworkId === caipNetworkId)
        fallbackCaipNetwork = this.caipNetworks?.find(
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
          !OptionsController.state.allowUnsupportedChain &&
          ChainController.state.activeCaipNetwork?.name === ConstantsUtil.UNSUPPORTED_NETWORK_NAME
        ) {
          ChainController.showUnsupportedChainUI()
        } else {
          this.setCaipNetwork(network)
        }
      }
      this.syncConnectedWalletInfo(chainNamespace)

      // Only update state when needed
      if (!HelpersUtil.isLowerCaseMatch(address, AccountController.state.address)) {
        this.setCaipAddress(`${chainNamespace}:${network?.id}:${address}`, chainNamespace)
        await this.syncIdentity({
          address,
          chainId: network?.id as string | number,
          chainNamespace
        })
      }
      await this.syncBalance({ address, chainId: network?.id, chainNamespace })
    }
  }

  private async syncBalance(params: {
    address: string
    chainId: string | number | undefined
    chainNamespace: ChainNamespace
  }) {
    const caipNetwork = NetworkUtil.getNetworksByNamespace(
      this.caipNetworks,
      params.chainNamespace
    ).find(n => n.id.toString() === params.chainId?.toString())

    if (!caipNetwork) {
      return
    }

    await this.updateNativeBalance()
  }

  private syncConnectedWalletInfo(chainNamespace: ChainNamespace) {
    const connectorId = StorageUtil.getConnectedConnectorId(chainNamespace)
    const providerType = ProviderUtil.getProviderId(chainNamespace)

    if (
      providerType === UtilConstantsUtil.CONNECTOR_TYPE_ANNOUNCED ||
      providerType === UtilConstantsUtil.CONNECTOR_TYPE_INJECTED
    ) {
      if (connectorId) {
        const connector = this.getConnectors().find(c => c.id === connectorId)
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

      this.setConnectedWalletInfo({ name: connectorId }, chainNamespace)
    }
  }

  private async syncIdentity({
    address,
    chainId,
    chainNamespace
  }: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
    chainNamespace: ChainNamespace
  }) {
    const activeCaipNetwork = this.caipNetworks?.find(
      n => n.caipNetworkId === `${chainNamespace}:${chainId}`
    )

    if (chainNamespace !== ConstantsUtil.CHAIN.EVM || activeCaipNetwork?.testnet) {
      return
    }

    try {
      const { name, avatar } = await this.fetchIdentity({
        address
      })

      this.setProfileName(name, chainNamespace)
      this.setProfileImage(avatar, chainNamespace)

      if (!name) {
        await this.syncReownName(address, chainNamespace)
        const adapter = this.getAdapter(chainNamespace)
        const result = await adapter?.getProfile({
          address,
          chainId: Number(chainId)
        })

        if (result?.profileName) {
          this.setProfileName(result.profileName, chainNamespace)
          if (result.profileImage) {
            this.setProfileImage(result.profileImage, chainNamespace)
          }
        } else {
          await this.syncReownName(address, chainNamespace)
          this.setProfileImage(null, chainNamespace)
        }
      }
    } catch {
      if (chainId === 1) {
        await this.syncReownName(address, chainNamespace)
      } else {
        await this.syncReownName(address, chainNamespace)
        this.setProfileImage(null, chainNamespace)
      }
    }
  }

  private async syncReownName(address: string, chainNamespace: ChainNamespace) {
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

  private async syncAdapterConnection(namespace: ChainNamespace) {
    const adapter = this.getAdapter(namespace)
    const connectorId = StorageUtil.getConnectedConnectorId(namespace)
    const caipNetwork = this.getCaipNetwork()

    try {
      if (!adapter || !connectorId) {
        throw new Error(`Adapter or connectorId not found for namespace ${namespace}`)
      }

      const connection = await adapter?.syncConnection({
        namespace,
        id: connectorId,
        chainId: caipNetwork?.id,
        rpcUrl: caipNetwork?.rpcUrls?.default?.http?.[0] as string
      })

      if (connection) {
        const accounts = await adapter?.getAccounts({
          namespace,
          id: connectorId
        })

        if (accounts && accounts.accounts.length > 0) {
          this.setAllAccounts(accounts.accounts, namespace)
        } else {
          this.setAllAccounts(
            [CoreHelperUtil.createAccount(namespace, connection.address, 'eoa')],
            namespace
          )
        }

        this.syncProvider({ ...connection, chainNamespace: namespace })
        await this.syncAccount({ ...connection, chainNamespace: namespace })

        this.setStatus('connected', namespace)
      } else {
        this.setStatus('disconnected', namespace)
      }
    } catch (e) {
      StorageUtil.deleteConnectedConnectorId(namespace)
      this.setStatus('disconnected', namespace)
    }
  }

  private async syncNamespaceConnection(namespace: ChainNamespace) {
    try {
      const connectorId = StorageUtil.getConnectedConnectorId(namespace)
      const isEmailUsed = this.authProvider?.getLoginEmailUsed()

      if (isEmailUsed) {
        return
      }

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
      StorageUtil.deleteConnectedConnectorId(namespace)
      this.setStatus('disconnected', namespace)
    }
  }

  private async syncExistingConnection() {
    await Promise.allSettled(
      this.chainNamespaces.map(namespace => this.syncNamespaceConnection(namespace))
    )
  }

  private getAdapter(namespace?: ChainNamespace) {
    if (!namespace) {
      return undefined
    }

    return this.chainAdapters?.[namespace]
  }

  private createUniversalProvider() {
    if (
      !this.universalProviderInitPromise &&
      CoreHelperUtil.isClient() &&
      this.options?.projectId
    ) {
      this.universalProviderInitPromise = this.initializeUniversalAdapter()
    }

    return this.universalProviderInitPromise
  }

  private handleAlertError(error: Error) {
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

  private async initializeUniversalAdapter() {
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

    OptionsController.setUsingInjectedUniversalProvider(Boolean(this.options?.universalProvider))
    this.universalProvider =
      this.options.universalProvider ?? (await UniversalProvider.init(universalProviderOptions))
    this.listenWalletConnect()
  }

  public async getUniversalProvider() {
    if (!this.universalProvider) {
      try {
        await this.createUniversalProvider()
      } catch (error) {
        throw new Error('AppKit:getUniversalProvider - Cannot create provider')
      }
    }

    return this.universalProvider
  }

  private createAuthProvider() {
    const isEmailEnabled =
      this.options?.features?.email === undefined
        ? CoreConstantsUtil.DEFAULT_FEATURES.email
        : this.options?.features?.email

    const isSocialsEnabled = this.options?.features?.socials
      ? this.options?.features?.socials?.length > 0
      : CoreConstantsUtil.DEFAULT_FEATURES.socials

    const isAuthEnabled = isEmailEnabled || isSocialsEnabled

    if (!this.authProvider && this.options?.projectId && isAuthEnabled) {
      this.authProvider = W3mFrameProviderSingleton.getInstance({
        projectId: this.options.projectId,
        enableLogger: this.options.enableAuthLogger,
        chainId: this.getCaipNetwork()?.caipNetworkId,
        onTimeout: () => {
          AlertController.open(ErrorUtil.ALERT_ERRORS.SOCIALS_TIMEOUT, 'error')
        }
      })
      this.subscribeState(val => {
        if (!val.open) {
          this.authProvider?.rejectRpcRequests()
        }
      })
      this.syncAuthConnector(this.authProvider)
    }
  }

  private async createUniversalProviderForAdapter(chainNamespace: ChainNamespace) {
    await this.getUniversalProvider()

    if (this.universalProvider) {
      this.chainAdapters?.[chainNamespace]?.setUniversalProvider?.(this.universalProvider)
    }
  }

  private createAuthProviderForAdapter(chainNamespace: ChainNamespace) {
    this.createAuthProvider()

    if (this.authProvider) {
      this.chainAdapters?.[chainNamespace]?.setAuthProvider?.(this.authProvider)
    }
  }

  private createAdapter(blueprint: AdapterBlueprint) {
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
      networks: this.caipNetworks
    })

    if (!this.chainNamespaces.includes(namespace)) {
      this.chainNamespaces.push(namespace)
    }

    if (this.chainAdapters) {
      this.chainAdapters[namespace] = adapterBlueprint
    }
  }

  private createAdapters(blueprints?: AdapterBlueprint[]) {
    this.createClients()

    return this.chainNamespaces.reduce<Adapters>((adapters, namespace) => {
      const blueprint = blueprints?.find(b => b.namespace === namespace)

      if (blueprint) {
        adapters[namespace] = blueprint
        adapters[namespace].namespace = namespace
        adapters[namespace].construct({
          namespace,
          projectId: this.options?.projectId,
          networks: this.caipNetworks
        })
      } else {
        adapters[namespace] = new UniversalAdapter({
          namespace,
          networks: this.caipNetworks
        })
      }

      return adapters
      // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    }, {} as Adapters)
  }

  private onConnectors(chainNamespace: ChainNamespace) {
    const adapter = this.getAdapter(chainNamespace)

    adapter?.on('connectors', this.setConnectors.bind(this))
  }

  private async initChainAdapter(namespace: ChainNamespace) {
    this.onConnectors(namespace)
    this.listenAdapter(namespace)
    this.chainAdapters?.[namespace].syncConnectors(this.options, this)
    await this.createUniversalProviderForAdapter(namespace)
    this.createAuthProviderForAdapter(namespace)
  }

  private async initChainAdapters() {
    await Promise.all(
      this.chainNamespaces.map(async namespace => {
        await this.initChainAdapter(namespace)
      })
    )
  }

  private getUnsupportedNetwork(caipNetworkId: CaipNetworkId) {
    return {
      id: caipNetworkId.split(':')[1],
      caipNetworkId,
      name: ConstantsUtil.UNSUPPORTED_NETWORK_NAME,
      chainNamespace: caipNetworkId.split(':')[0],
      nativeCurrency: {
        name: '',
        decimals: 0,
        symbol: ''
      },
      rpcUrls: {
        default: {
          http: []
        }
      }
    } as CaipNetwork
  }

  private getDefaultNetwork() {
    const caipNetworkId = StorageUtil.getActiveCaipNetworkId()

    if (caipNetworkId) {
      const caipNetwork = this.caipNetworks?.find(n => n.caipNetworkId === caipNetworkId)

      if (caipNetwork) {
        return caipNetwork
      }

      return this.getUnsupportedNetwork(caipNetworkId)
    }

    return this.caipNetworks?.[0]
  }

  private async injectModalUi() {
    if (!this.initPromise && !isInitialized && CoreHelperUtil.isClient()) {
      isInitialized = true
      this.initPromise = new Promise<void>(async resolve => {
        await Promise.all([
          import('@reown/appkit-ui'),
          import('@reown/appkit-scaffold-ui/w3m-modal')
        ])
        const modal = document.createElement('w3m-modal')
        if (!OptionsController.state.disableAppend && !OptionsController.state.enableEmbedded) {
          document.body.insertAdjacentElement('beforeend', modal)
        }
        resolve()
      })
    }

    return this.initPromise
  }
}
