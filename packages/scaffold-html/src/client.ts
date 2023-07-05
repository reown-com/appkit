import type {
  AccountControllerClient,
  ConnectionControllerClient,
  NetworkControllerClient
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

  // -- Private ------------------------------------------------------------------
  #setControllerClients(options: Options) {
    AccountController.setClient(options.accountControllerClient)
    NetworkController.setClient(options.networkControllerClient)
    ConnectionController.setClient(options.connectionControllerClient)
  }

  async #initOrContinue() {
    if (!this.#initPromise && HelperUtil.isClient()) {
      this.#initPromise = new Promise<void>(async resolve => {
        await import('./modal')
        const modal = document.createElement('w3m-modal')
        document.body.insertAdjacentElement('beforeend', modal)
        resolve()
      })
    }

    return this.#initPromise
  }
}
