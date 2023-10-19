import type { Chain } from '@wagmi/core'
import { Connector } from '@wagmi/core'
import { W3mFrameProvider } from '@web3modal/smart-account'
import { createWalletClient, custom } from 'viem'

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

  async connect() {
    const { address } = await this.provider.connect()

    return {
      account: address as `0x${string}`,
      // IMPLEMENT: Return propper chain id and if it is supported or not
      chain: {
        id: 1,
        unsupported: this.isChainUnsupported(1)
      }
    }
  }

  async disconnect() {
    // IMPLEMENT
  }

  async getAccount() {
    // IMPLEMENT
    return Promise.resolve('0x000' as `0x${string}`)
  }

  async getChainId() {
    // IMPLEMENT
    return Promise.resolve(1)
  }

  async getWalletClient() {
    // IMPLEMENT
    return Promise.resolve(
      createWalletClient({
        account: '0x000' as `0x${string}`,
        chain: { id: 1 } as Chain,
        transport: custom(this.provider)
      })
    )
  }

  async isAuthorized() {
    return Promise.resolve(false)
  }

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
