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

  private provider: W3mFrameProvider = {} as W3mFrameProvider

  public constructor(config: { chains?: Chain[]; options: W3mFrameProviderOptions }) {
    super(config)
    if (typeof window !== 'undefined') {
      this.provider = new W3mFrameProvider(config.options.projectId)
    }
  }

  async getProvider() {
    return Promise.resolve(this.provider)
  }

  async connect() {
    const { address, chainId } = await this.provider.connect()

    return {
      account: address as `0x${string}`,
      chain: {
        id: chainId,
        unsupported: this.isChainUnsupported(1)
      }
    }
  }

  async disconnect() {
    await this.provider.disconnect()
  }

  async getAccount() {
    const { address } = await this.provider.connect()

    return address as `0x${string}`
  }

  async getChainId() {
    const { chainId } = await this.provider.getChainId()

    return chainId
  }

  async getWalletClient() {
    const { address, chainId } = await this.provider.connect()

    return Promise.resolve(
      createWalletClient({
        account: address as `0x${string}`,
        chain: { id: chainId } as Chain,
        transport: custom(this.provider)
      })
    )
  }

  async isAuthorized() {
    const { isConnected } = await this.provider.isConnected()

    return isConnected
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
