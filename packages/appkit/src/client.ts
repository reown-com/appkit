import type {
  EventsControllerState,
  PublicStateControllerState,
  ThemeControllerState,
  ModalControllerState,
  ConnectedWalletInfo,
  RouterControllerState,
  ChainAdapter,
  SdkVersion
} from '@rerock/appkit-core'
import {
  AccountController,
  BlockchainApiController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  ChainController,
  PublicStateController,
  ThemeController,
  SnackController,
  RouterController,
  EnsController,
  OptionsController,
  NetworkController,
  AssetUtil
} from '@rerock/appkit-core'
import { setColorTheme, setThemeVariables } from '@rerock/ui'
import { ConstantsUtil, type CaipNetwork, type ChainNamespace } from '@rerock/appkit-common'
import type { AppKitOptions } from './utils/TypesUtil.js'
import { UniversalAdapterClient } from './universal-adapter/client.js'
import { PresetsUtil } from '@rerock/scaffold-utils'
import type { W3mFrameTypes } from '@rerock/wallet'
import { ProviderUtil } from './store/ProviderUtil.js'

// -- Export Controllers -------------------------------------------------------
export { AccountController, NetworkController }

// -- Types --------------------------------------------------------------------
export interface OpenOptions {
  view: 'Account' | 'Connect' | 'Networks' | 'ApproveTransaction' | 'OnRampProviders'
}

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

// -- Client --------------------------------------------------------------------
export class AppKit {
  private static instance?: AppKit

  public adapter?: ChainAdapter

  public adapters?: ChainAdapter[]

  public universalAdapter?: UniversalAdapterClient

  private initPromise?: Promise<void> = undefined

  public constructor(
    options: AppKitOptions & {
      adapters?: ChainAdapter[]
    } & {
      sdkVersion: SdkVersion
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    this.adapter = options.adapters?.[0] as ChainAdapter
    this.initControllers(options)
    this.initOrContinue()
  }

  public static getInstance() {
    return this.instance
  }

  // -- Public -------------------------------------------------------------------
  public async open(options?: OpenOptions) {
    await this.initOrContinue()
    ModalController.open(options)
  }

  public async close() {
    await this.initOrContinue()
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
    return NetworkController.state.caipNetwork?.chainId
  }

  public switchNetwork(caipNetwork: CaipNetwork) {
    return NetworkController.switchActiveNetwork(caipNetwork)
  }

  public getIsConnected() {
    return AccountController.state.isConnected
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

  public subscribeProvider() {
    return null
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

  public subscribeWalletInfo(callback: (newState: ConnectedWalletInfo) => void) {
    return AccountController.subscribeKey('connectedWalletInfo', callback)
  }

  public subscribeShouldUpdateToAddress(callback: (newState?: string) => void) {
    AccountController.subscribeKey('shouldUpdateToAddress', callback)
  }

  public subscribeCaipNetworkChange(callback: (newState?: CaipNetwork) => void) {
    NetworkController.subscribeKey('caipNetwork', callback)
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

  public isTransactionShouldReplaceView() {
    return RouterController.state.transactionStack[
      RouterController.state.transactionStack.length - 1
    ]?.replace
  }

  public setIsConnected: (typeof AccountController)['setIsConnected'] = (isConnected, chain) => {
    AccountController.setIsConnected(isConnected, chain)
  }

  public setStatus: (typeof AccountController)['setStatus'] = (status, chain) => {
    AccountController.setStatus(status, chain)
  }

  public getIsConnectedState = () => AccountController.state.isConnected

  public setAllAccounts: (typeof AccountController)['setAllAccounts'] = (addresses, chain) => {
    AccountController.setAllAccounts(addresses, chain)
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

  public getCaipAddress = () => AccountController.state.caipAddress

  public getAddress = (chainNamespace?: ChainNamespace) => {
    if (ChainController.state.activeChain === chainNamespace || !chainNamespace) {
      return AccountController.state.address
    }

    return ChainController.getAccountProp('address', chainNamespace)
  }

  public getProvider = () => AccountController.state.provider

  public getPreferredAccountType = () =>
    AccountController.state.preferredAccountType as W3mFrameTypes.AccountType

  public setCaipAddress: (typeof AccountController)['setCaipAddress'] = (caipAddress, chain) => {
    AccountController.setCaipAddress(caipAddress, chain)
  }

  public setProvider: (typeof AccountController)['setProvider'] = (provider, chain) => {
    AccountController.setProvider(provider, chain)
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

  public resetAccount: (typeof AccountController)['resetAccount'] = (chain: ChainNamespace) => {
    AccountController.resetAccount(chain)
  }

  public setCaipNetwork: (typeof NetworkController)['setCaipNetwork'] = caipNetwork => {
    NetworkController.setActiveCaipNetwork(caipNetwork)
  }

  public getCaipNetwork = (chainNamespace?: ChainNamespace) => {
    if (chainNamespace) {
      return NetworkController.getRequestedCaipNetworks().filter(
        c => c.chainNamespace === chainNamespace
      )?.[0]
    }

    return NetworkController.state.caipNetwork
  }

  public getActiveChainNamespace = () => ChainController.state.activeChain

  public setRequestedCaipNetworks: (typeof NetworkController)['setRequestedCaipNetworks'] = (
    requestedCaipNetworks,
    chain: ChainNamespace
  ) => {
    NetworkController.setRequestedCaipNetworks(requestedCaipNetworks, chain)
  }

  public getApprovedCaipNetworkIds: (typeof NetworkController)['getApprovedCaipNetworkIds'] = () =>
    NetworkController.getApprovedCaipNetworkIds()

  public setApprovedCaipNetworksData: (typeof NetworkController)['setApprovedCaipNetworksData'] =
    chain => NetworkController.setApprovedCaipNetworksData(chain)

  public resetNetwork: (typeof NetworkController)['resetNetwork'] = () => {
    NetworkController.resetNetwork()
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

  public setSmartAccountEnabledNetworks: (typeof NetworkController)['setSmartAccountEnabledNetworks'] =
    (smartAccountEnabledNetworks, chain) => {
      NetworkController.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks, chain)
    }

  public setPreferredAccountType: (typeof AccountController)['setPreferredAccountType'] = (
    preferredAccountType,
    chain
  ) => {
    AccountController.setPreferredAccountType(preferredAccountType, chain)
  }

  public getWalletConnectName: (typeof EnsController)['getNamesForAddress'] = address =>
    EnsController.getNamesForAddress(address)

  public resolveWalletConnectName = async (name: string) => {
    const trimmedName = name.replace(ConstantsUtil.WC_NAME_SUFFIX, '')
    const wcNameAddress = await EnsController.resolveName(trimmedName)
    const networkNameAddresses = Object.values(wcNameAddress?.addresses) || []

    return networkNameAddresses[0]?.address || false
  }

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

  // -- Private ------------------------------------------------------------------
  private async initControllers(
    options: AppKitOptions & {
      adapters?: ChainAdapter[]
    } & {
      sdkVersion: SdkVersion
    }
  ) {
    OptionsController.setProjectId(options.projectId)
    OptionsController.setSdkVersion(options.sdkVersion)

    this.adapters = options.adapters

    options.metadata ||= {
      name:
        typeof document === 'undefined'
          ? ''
          : document.getElementsByTagName('title')[0]?.textContent || '',
      description:
        typeof document === 'undefined'
          ? ''
          : document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content ||
            '',
      url: typeof window === 'undefined' ? '' : window.location.origin,
      icons: [
        typeof document === 'undefined'
          ? ''
          : document.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href || ''
      ]
    }

    this.initializeUniversalAdapter(options)
    this.initializeAdapters(options)

    OptionsController.setAllWallets(options.allWallets)
    OptionsController.setIncludeWalletIds(options.includeWalletIds)
    OptionsController.setExcludeWalletIds(options.excludeWalletIds)
    OptionsController.setFeaturedWalletIds(options.featuredWalletIds)
    OptionsController.setTokens(options.tokens)
    OptionsController.setTermsConditionsUrl(options.termsConditionsUrl)
    OptionsController.setPrivacyPolicyUrl(options.privacyPolicyUrl)
    OptionsController.setCustomWallets(options.customWallets)
    OptionsController.setFeatures(options.features)

    if (options.metadata) {
      OptionsController.setMetadata(options.metadata)
    }

    if (options.themeMode) {
      ThemeController.setThemeMode(options.themeMode)
    }

    if (options.themeVariables) {
      ThemeController.setThemeVariables(options.themeVariables)
    }

    if (options.disableAppend) {
      OptionsController.setDisableAppend(Boolean(options.disableAppend))
    }

    const evmAdapter = options.adapters?.find(
      adapter => adapter.chainNamespace === ConstantsUtil.CHAIN.EVM
    )

    // Set the SIWE client for EVM chains
    if (evmAdapter) {
      if (options.siweConfig) {
        const { SIWEController } = await import('@rerock/siwe')
        SIWEController.setSIWEClient(options.siweConfig)
      }
    }
  }

  private initializeUniversalAdapter(options: AppKitOptions) {
    const caipNetworks = this.extendCaipNetworksWithImages(
      options.caipNetworks,
      options.chainImages
    )
    this.universalAdapter = new UniversalAdapterClient({
      ...options,
      caipNetworks
    })

    ChainController.initializeUniversalAdapter(this.universalAdapter, options.adapters || [])

    this.universalAdapter.construct?.(this, options)

    NetworkController.setDefaultCaipNetwork(options.defaultCaipNetwork)
  }

  private initializeAdapters(options: AppKitOptions) {
    ChainController.initialize(options.adapters || [])
    options.adapters?.forEach(adapter => {
      const caipNetworks = this.extendCaipNetworksWithImages(
        options.caipNetworks,
        options.chainImages
      )
      options.caipNetworks = caipNetworks
      // @ts-expect-error will introduce construct later
      adapter.construct?.(this, options)

      NetworkController.setDefaultCaipNetwork(options.defaultCaipNetwork)
    })
  }

  private async initOrContinue() {
    if (!this.initPromise && !isInitialized && CoreHelperUtil.isClient()) {
      isInitialized = true
      this.initPromise = new Promise<void>(async resolve => {
        await Promise.all([import('@rerock/ui'), import('@rerock/appkit-scaffold-ui/w3m-modal')])
        const modal = document.createElement('w3m-modal')
        if (!OptionsController.state.disableAppend) {
          document.body.insertAdjacentElement('beforeend', modal)
        }
        resolve()
      })
    }

    return this.initPromise
  }

  private extendCaipNetworksWithImages(
    caipNetworks: CaipNetwork[],
    caipNetworkImages?: Record<number | string, string>
  ): CaipNetwork[] {
    return caipNetworks.map(caipNetwork => ({
      ...caipNetwork,
      imageId: PresetsUtil.NetworkImageIds[caipNetwork.chainId],
      imageUrl: caipNetworkImages?.[caipNetwork.chainId]
    }))
  }
}
