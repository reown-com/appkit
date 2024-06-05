import type {
  EventsControllerState,
  PublicStateControllerState,
  ThemeControllerState,
  OptionsControllerState,
  ModalControllerState,
  ConnectedWalletInfo,
  RouterControllerState,
  AdapterCore
} from '@web3modal/core'
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
  OptionsController
} from '@web3modal/core'
import { setColorTheme, setThemeVariables } from '@web3modal/ui'
import { ConstantsUtil } from '@web3modal/common'

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

export interface OpenOptions {
  view: 'Account' | 'Connect' | 'Networks' | 'ApproveTransaction' | 'OnRampProviders'
}

// -- Client --------------------------------------------------------------------
export class Appkit {
  private static instance?: Appkit

  public adapters?: AdapterCore[]

  private initPromise?: Promise<void> = undefined

  public constructor(options: OptionsControllerState) {
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

  // -- Protected ----------------------------------------------------------------
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

  public setIsConnected: (typeof AccountController)['setIsConnected'] = isConnected => {
    AccountController.setIsConnected(isConnected)
  }

  public getIsConnectedState = () => AccountController.state.isConnected

  public setCaipAddress: (typeof AccountController)['setCaipAddress'] = caipAddress => {
    AccountController.setCaipAddress(caipAddress)
  }

  public setBalance: (typeof AccountController)['setBalance'] = (balance, balanceSymbol) => {
    AccountController.setBalance(balance, balanceSymbol)
  }

  public setProfileName: (typeof AccountController)['setProfileName'] = profileName => {
    AccountController.setProfileName(profileName)
  }

  public setProfileImage: (typeof AccountController)['setProfileImage'] = profileImage => {
    AccountController.setProfileImage(profileImage)
  }

  public resetAccount: (typeof AccountController)['resetAccount'] = () => {
    AccountController.resetAccount()
  }

  public setCaipNetwork: (typeof ChainController)['setCaipNetwork'] = (caipNetwork, protocol) => {
    ChainController.setCaipNetwork(caipNetwork, protocol)
  }

  public getCaipNetwork = () => ChainController.activeNetwork()

  public setRequestedCaipNetworks: (typeof ChainController)['setRequestedCaipNetworks'] = (
    requestedCaipNetworks,
    protocol
  ) => {
    ChainController.setRequestedCaipNetworks(requestedCaipNetworks, protocol)
  }

  public getApprovedCaipNetworksData: (typeof ChainController)['getApprovedCaipNetworksData'] =
    () => ChainController.getApprovedCaipNetworksData()

  public resetNetwork: (typeof ChainController)['resetNetwork'] = () => {
    ChainController.resetNetwork(ChainController.state.activeProtocol || 'evm')
  }

  public setConnectors: (typeof ConnectorController)['setConnectors'] = connectors => {
    ConnectorController.setConnectors(connectors)
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

  public setAddressExplorerUrl: (typeof AccountController)['setAddressExplorerUrl'] =
    addressExplorerUrl => {
      AccountController.setAddressExplorerUrl(addressExplorerUrl)
    }

  public setSmartAccountDeployed: (typeof AccountController)['setSmartAccountDeployed'] =
    isDeployed => {
      AccountController.setSmartAccountDeployed(isDeployed)
    }

  public setConnectedWalletInfo: (typeof AccountController)['setConnectedWalletInfo'] =
    connectedWalletInfo => {
      AccountController.setConnectedWalletInfo(connectedWalletInfo)
    }

  public setSmartAccountEnabledNetworks: (typeof ChainController)['setSmartAccountEnabledNetworks'] =
    smartAccountEnabledNetworks => {
      ChainController.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks)
    }

  public setPreferredAccountType: (typeof AccountController)['setPreferredAccountType'] =
    preferredAccountType => {
      AccountController.setPreferredAccountType(preferredAccountType)
    }

  protected getWalletConnectName: (typeof EnsController)['getNamesForAddress'] = address =>
    EnsController.getNamesForAddress(address)

  public resolveWalletConnectName = async (name: string) => {
    const trimmedName = name.replace(ConstantsUtil.WC_NAME_SUFFIX, '')
    const wcNameAddress = await EnsController.resolveName(trimmedName)
    const networkNameAddresses = Object.values(wcNameAddress?.addresses) || []

    return networkNameAddresses[0]?.address || false
  }

  // -- Private ------------------------------------------------------------------
  private async initControllers(options: OptionsControllerState) {
    options.adapters?.forEach(adapter => {
      adapter.construct(this, options)
    })

    ChainController.setAdapters(options.adapters || [])

    const defaultAdapter = options.adapters?.[0]

    if (defaultAdapter) {
      ChainController.setAdapter(defaultAdapter)
      ChainController.setDefaultCaipNetwork(options.defaultChain, defaultAdapter.protocol)
    }

    OptionsController.setOptions(options)

    if (options.themeMode) {
      ThemeController.setThemeMode(options.themeMode)
    }

    if (options.themeVariables) {
      ThemeController.setThemeVariables(options.themeVariables)
    }

    if (options.allowUnsupportedChain) {
      ChainController.setAllowUnsupportedChain(options.allowUnsupportedChain)
    }

    if (options.siweConfig) {
      const { SIWEController } = await import('@web3modal/siwe')

      SIWEController.setSIWEClient(options.siweConfig)
    }
  }

  private async initOrContinue() {
    if (!this.initPromise && !isInitialized && CoreHelperUtil.isClient()) {
      isInitialized = true
      this.initPromise = new Promise<void>(async resolve => {
        await Promise.all([import('@web3modal/ui'), import('./modal/w3m-modal/index.js')])
        const modal = document.createElement('w3m-modal')
        document.body.insertAdjacentElement('beforeend', modal)
        resolve()
      })
    }

    return this.initPromise
  }
}
