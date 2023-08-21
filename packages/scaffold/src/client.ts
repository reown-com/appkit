import type {
  ApiControllerState,
  ConnectionControllerClient,
  ModalControllerArguments,
  NetworkControllerClient,
  ThemeMode,
  ThemeVariables
} from '@web3modal/core'
import {
  AccountController,
  ApiController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  ModalController,
  NetworkController,
  ThemeController
} from '@web3modal/core'

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

// -- Types ---------------------------------------------------------------------
interface Options {
  networkControllerClient: NetworkControllerClient
  connectionControllerClient: ConnectionControllerClient
  projectId: ApiControllerState['projectId']
  sdkVersion: ApiControllerState['sdkVersion']
  themeMode?: ThemeMode
  themeVariables?: ThemeVariables
}

// -- Client --------------------------------------------------------------------
export class Web3ModalScaffold {
  private initPromise?: Promise<void> = undefined

  public constructor(options: Options) {
    this.initControllers(options)
    this.initOrContinue()
  }

  // -- Public -------------------------------------------------------------------
  public async open(options?: ModalControllerArguments['open']) {
    await this.initOrContinue()
    ModalController.open(options)
  }

  public unsubscribe: (() => void)[] = []

  public async close() {
    await this.initOrContinue()
    ModalController.close()
  }

  public getThemeMode() {
    return ThemeController.state.themeMode
  }

  public getThemeVariables() {
    return ThemeController.state.themeVariables
  }

  public setThemeMode(themeMode: ThemeMode) {
    ThemeController.setThemeMode(themeMode)
    ThemeController.updateThemeMode(themeMode)
  }

  public setThemeVariables(themeVariables: ThemeVariables) {
    ThemeController.setThemeVariables(themeVariables)
    ThemeController.updateThemeVariables(themeVariables)
  }

  public subscribeThemeMode(setter: (value: ThemeMode) => void) {
    this.unsubscribe.push(
      ThemeController.subscribeKey('themeMode', val => {
        setter(val)
      })
    )
  }

  public subscribeThemeVariables(setter: (value: ThemeVariables) => void) {
    this.unsubscribe.push(
      ThemeController.subscribeKey('themeVariables', val => {
        setter(val)
      })
    )
  }

  public unmount() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Protected ----------------------------------------------------------------
  protected setIsConnected: (typeof AccountController)['setIsConnected'] = isConnected => {
    AccountController.setIsConnected(isConnected)
  }

  protected setCaipAddress: (typeof AccountController)['setCaipAddress'] = caipAddress => {
    AccountController.setCaipAddress(caipAddress)
  }

  protected setBalance: (typeof AccountController)['setBalance'] = (balance, balanceSymbol) => {
    AccountController.setBalance(balance, balanceSymbol)
  }

  protected setProfileName: (typeof AccountController)['setProfileName'] = profileName => {
    AccountController.setProfileName(profileName)
  }

  protected setProfileImage: (typeof AccountController)['setProfileImage'] = profileImage => {
    AccountController.setProfileImage(profileImage)
  }

  protected resetAccount: (typeof AccountController)['resetAccount'] = () => {
    AccountController.resetAccount()
  }

  protected setCaipNetwork: (typeof NetworkController)['setCaipNetwork'] = caipNetwork => {
    NetworkController.setCaipNetwork(caipNetwork)
  }

  protected getCaipNetwork = () => NetworkController.state.caipNetwork

  protected setRequestedCaipNetworks: (typeof NetworkController)['setRequestedCaipNetworks'] =
    requestedCaipNetworks => {
      NetworkController.setRequestedCaipNetworks(requestedCaipNetworks)
    }

  protected getApprovedCaipNetworksData: (typeof NetworkController)['getApprovedCaipNetworksData'] =
    () => NetworkController.getApprovedCaipNetworksData()

  protected resetNetwork: (typeof NetworkController)['resetNetwork'] = () => {
    NetworkController.resetNetwork()
  }

  protected setConnectors: (typeof ConnectorController)['setConnectors'] = connectors => {
    ConnectorController.setConnectors(connectors)
  }

  protected resetWcConnection: (typeof ConnectionController)['resetWcConnection'] = () => {
    ConnectionController.resetWcConnection()
  }

  // -- Private ------------------------------------------------------------------
  private initControllers(options: Options) {
    NetworkController.setClient(options.networkControllerClient)
    ConnectionController.setClient(options.connectionControllerClient)
    ApiController.setProjectId(options.projectId)
    ApiController.setSdkVersion(options.sdkVersion)
    if (options.themeMode) {
      ThemeController.setThemeMode(options.themeMode)
    }
    if (options.themeVariables) {
      ThemeController.setThemeVariables(options.themeVariables)
    }
  }

  private async initOrContinue() {
    if (!this.initPromise && !isInitialized && CoreHelperUtil.isClient()) {
      isInitialized = true
      this.initPromise = new Promise<void>(async resolve => {
        await Promise.all([import('@web3modal/ui'), import('./modal/w3m-modal')])
        const modal = document.createElement('w3m-modal')
        document.body.insertAdjacentElement('beforeend', modal)
        resolve()
      })
    }

    return this.initPromise
  }
}
