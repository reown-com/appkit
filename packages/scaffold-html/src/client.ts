import type {
  AccountControllerClientProxy,
  NetworkControllerClientProxy,
  ConnectionControllerClientProxy
} from '@web3modal/core'

// -- Types ---------------------------------------------------------------------
interface Options {
  accountControllerClientProxy: AccountControllerClientProxy
  networkControllerClientProxy: NetworkControllerClientProxy
  connectionControllerClientProxy: ConnectionControllerClientProxy
}

// -- Client --------------------------------------------------------------------
export class Web3ModalScaffoldHtml {
  #initPromise?: Promise<void> = undefined

  public constructor(options: Options) {
    this.#createControllers(options)
    this.#initOrContinue()
  }

  #createControllers(options: Options) {}

  async #initOrContinue() {
    if (!this.#initPromise && typeof window !== 'undefined') {
      this.#initPromise = new Promise<void>(async resolve => {
        const Web3ModalUi = await import('@web3modal/ui')
        Web3ModalUi.initializeTheming()
        resolve()
      })
    }

    return this.#initPromise
  }
}
