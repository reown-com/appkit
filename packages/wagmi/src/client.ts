import { Web3ModalScaffoldHtml } from '@web3modal/scaffold-html'

export class Web3Modal extends Web3ModalScaffoldHtml {
  public constructor() {
    super({
      accountControllerClient: {},
      networkControllerClient: {},
      connectionControllerClient: {}
    })
  }
}
