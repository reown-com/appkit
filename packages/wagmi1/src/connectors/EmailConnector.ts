import type { Chain, WalletClient } from '@wagmi/core'
import { Connector } from '@wagmi/core'
import { W3mFrameProvider } from '@web3modal/wallet'
import { createWalletClient, custom, SwitchChainError } from 'viem'

// -- Types ----------------------------------------------------------------------------------------
interface W3mFrameProviderOptions {
  projectId: string
}

interface Config {
  chains?: Chain[]
  options: W3mFrameProviderOptions
}

interface ConnectOptions {
  chainId?: number
}

// -- Connector ------------------------------------------------------------------------------------
export class EmailConnector extends Connector<W3mFrameProvider, W3mFrameProviderOptions> {
  readonly id = 'w3mEmail'

  readonly name = 'Web3Modal Email'

  readonly ready = true

  private provider: W3mFrameProvider = {} as W3mFrameProvider

  public constructor(config: Config) {
    super(config)
    if (typeof window !== 'undefined') {
      this.provider = new W3mFrameProvider(config.options.projectId)
    }
  }

  async getProvider() {
    return Promise.resolve(this.provider)
  }

  async connect(options: ConnectOptions = {}) {
    const { address, chainId } = await this.provider.connect({ chainId: options.chainId })

    return {
      account: address as `0x${string}`,
      chain: {
        id: chainId,
        unsupported: this.isChainUnsupported(1)
      }
    }
  }

  override async switchChain(chainId: number) {
    try {
      const chain = this.chains.find(c => c.id === chainId)
      if (!chain) {
        throw new SwitchChainError(new Error('chain not found on connector.'))
      }
      await this.provider.switchNetwork(chainId)
      const unsupported = this.isChainUnsupported(chainId)
      this.emit('change', { chain: { id: chainId, unsupported } })

      return chain
    } catch (error) {
      if (error instanceof Error) {
        throw new SwitchChainError(error)
      }
      throw error
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

  async getWalletClient(): Promise<WalletClient> {
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
