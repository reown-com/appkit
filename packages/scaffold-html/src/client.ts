import type {
  ConnectionControllerClient,
  ExplorerApiControllerState,
  ModalControllerArguments,
  NetworkControllerClient
} from '@web3modal/core'
import {
  AccountController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  ExplorerApiController,
  ModalController,
  NetworkController
} from '@web3modal/core'

// -- Helpers -------------------------------------------------------------------
let isInitialized = false

// -- Types ---------------------------------------------------------------------
interface Options {
  networkControllerClient: NetworkControllerClient
  connectionControllerClient: ConnectionControllerClient
  projectId: ExplorerApiControllerState['projectId']
}

// -- Client --------------------------------------------------------------------
export class Web3ModalScaffoldHtml {
  private initPromise?: Promise<void> = undefined

  public constructor(options: Options) {
    if (isInitialized) {
      throw new Error('Web3Modal is already initialized')
    }
    this.initControllers(options)
    this.initOrContinue()
    isInitialized = true
  }

  // -- Public -------------------------------------------------------------------
  public async open(options?: ModalControllerArguments['open']) {
    await this.initOrContinue()
    ModalController.open(options)
  }

  public async close() {
    await this.initOrContinue()
    ModalController.close()
  }

  // -- Protected ----------------------------------------------------------------
  protected setIsConnected: (typeof AccountController)['setIsConnected'] = isConnected => {
    AccountController.setIsConnected(isConnected)
  }

  protected setCaipAddress: (typeof AccountController)['setCaipAddress'] = caipAddress => {
    AccountController.setCaipAddress(caipAddress)
  }

  protected setBalance: (typeof AccountController)['setBalance'] = balance => {
    AccountController.setBalance(balance)
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
    ExplorerApiController.setProjectId(options.projectId)
  }

  private async initOrContinue() {
    if (!this.initPromise && CoreHelperUtil.isClient()) {
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
