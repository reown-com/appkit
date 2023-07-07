import type {
  AccountControllerClient,
  AccountControllerState,
  ConnectionControllerClient,
  NetworkControllerClient,
  NetworkControllerState
} from '@web3modal/core'
import {
  AccountController,
  ConnectionController,
  HelperUtil,
  ModalController,
  NetworkController
} from '@web3modal/core'

// -- Types ---------------------------------------------------------------------
interface Options {
  accountControllerClient: AccountControllerClient
  networkControllerClient: NetworkControllerClient
  connectionControllerClient: ConnectionControllerClient
}

// -- Client --------------------------------------------------------------------
export class Web3ModalScaffoldHtml {
  #initPromise?: Promise<void> = undefined

  public constructor(options: Options) {
    this.#setControllerClients(options)
    this.#initOrContinue()
  }

  // -- Public -------------------------------------------------------------------
  public async open() {
    await this.#initOrContinue()
    ModalController.open()
  }

  public async close() {
    await this.#initOrContinue()
    ModalController.close()
  }

  // -- Internal -----------------------------------------------------------------
  public _setAddress(address: AccountControllerState['address']) {
    AccountController.setAddress(address)
  }

  public _setNetwork(network: NetworkControllerState['network']) {
    NetworkController.setNetwork(network)
  }

  // -- Private ------------------------------------------------------------------
  #setControllerClients(options: Options) {
    AccountController.setClient(options.accountControllerClient)
    NetworkController.setClient(options.networkControllerClient)
    ConnectionController.setClient(options.connectionControllerClient)
  }

  async #initOrContinue() {
    if (!this.#initPromise && HelperUtil.isClient()) {
      this.#initPromise = new Promise<void>(async resolve => {
        await Promise.all([import('@web3modal/ui'), import('./modal/w3m-modal')])
        const modal = document.createElement('w3m-modal')
        document.body.insertAdjacentElement('beforeend', modal)
        resolve()
      })
    }

    return this.#initPromise
  }
}
