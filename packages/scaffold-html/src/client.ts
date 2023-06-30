export class Web3ModalScaffoldHtml {
  #initPromise?: Promise<void> = undefined

  public constructor() {
    this.#initOrContinue()
  }

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
