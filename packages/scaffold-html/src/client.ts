import type {
  AccountControllerClient,
  ConnectionControllerClient,
  NetworkControllerClient
} from '@web3modal/core'
import {
  AccountController,
  ConnectionController,
  HelperUtil,
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

  #setControllerClients(options: Options) {
    AccountController.setClient(options.accountControllerClient)
    NetworkController.setClient(options.networkControllerClient)
    ConnectionController.setClient(options.connectionControllerClient)
  }

  async #initOrContinue() {
    if (!this.#initPromise && HelperUtil.isClient()) {
      this.#initPromise = new Promise<void>(async resolve => {
        const Web3ModalUi = await import('@web3modal/ui')
        Web3ModalUi.initializeTheming()
        resolve()
      })
    }

    return this.#initPromise
  }
}
