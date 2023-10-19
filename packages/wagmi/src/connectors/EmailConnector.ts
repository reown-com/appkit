import type { Chain } from '@wagmi/core'
import { Connector } from '@wagmi/core'
import { W3mFrameProvider } from '@web3modal/smart-account'

interface W3mFrameProviderOptions {
  projectId: string
}

export class EmailConnector extends Connector<W3mFrameProvider, W3mFrameProviderOptions> {
  readonly id = 'w3mEmail'

  readonly name = 'Web3Modal Email'

  readonly ready = true

  private provider: W3mFrameProvider

  public constructor(config: { chains?: Chain[]; options: W3mFrameProviderOptions }) {
    super(config)
    this.provider = new W3mFrameProvider(config.options.projectId)
  }

  async getProvider() {
    return Promise.resolve(this.provider)
  }

  async connect() {}

  async disconnect() {}

  async getAccount() {}

  async getChainId() {}

  async getWalletClient() {}

  async isAuthorized() {}

  onAccountsChanged() {
    // IMPLEMENT
  }

  onChainChanged() {
    // IMPLEMENT
  }

  onDisconnect() {
    // IMPLEMENT
  }
}
