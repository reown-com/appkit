import { createConnector, normalizeChainId } from '@wagmi/core'
import { W3mFrameProvider } from '@web3modal/wallet'
import {
  type Address,
  SwitchChainError,
  getAddress,
  type Chain,
  type WalletClient,
  createWalletClient,
  custom
} from 'viem'

import { ConstantsUtil } from '@web3modal/scaffold-utils'

// -- Types ----------------------------------------------------------------------------------------
interface W3mFrameProviderOptions {
  projectId: string
}

interface ConnectOptions {
  chainId?: number
}

export type EmailParameters = {
  chains?: Chain[]
  options: W3mFrameProviderOptions
}

emailConnector.type = 'email' as const
export function emailConnector(parameters: EmailParameters) {
  type Properties = {
    connect(opts: ConnectOptions): Promise<{
      accounts: Address[]
      account: Address
      chainId: number
    }>
    getProvider(): Promise<W3mFrameProvider>
    disconnect(): Promise<void>
    getChainId(): Promise<number>
    getWalletClient(): Promise<WalletClient>
    isAuthorized(): Promise<boolean>
    chains: readonly [Chain, ...Chain[]]
  }

  return createConnector<W3mFrameProvider, Properties>(config => ({
    id: ConstantsUtil.EMAIL_CONNECTOR_ID,
    name: 'Web3Modal Email',
    type: emailConnector.type,
    async connect(options: ConnectOptions = {}) {
      const provider = await this.getProvider()
      const { address, chainId } = await provider.connect({ chainId: options.chainId })

      return {
        accounts: [address as Address],
        account: address as Address,
        chainId,
        chain: {
          id: chainId,
          unsuported: false
        }
      }
    },
    async disconnect() {
      const provider = await this.getProvider()
      await provider.disconnect()
    },
    async getAccounts() {
      const provider = await this.getProvider()
      const { address } = await provider.connect()

      return [address as Address]
    },

    async getProvider() {
      return Promise.resolve(new W3mFrameProvider(parameters.options.projectId))
    },
    async getChainId() {
      const provider: W3mFrameProvider = await this.getProvider()
      const { chainId } = await provider.getChainId()

      return chainId
    },
    async isAuthorized() {
      const provider = await this.getProvider()
      const { isConnected } = await provider.isConnected()

      return isConnected
    },
    async switchChain({ chainId }) {
      try {
        const chain = this.chains.find(c => c.id === chainId)
        if (!chain) {
          throw new SwitchChainError(new Error('chain not found on connector.'))
        }
        const provider = await this.getProvider()
        await provider.switchNetwork(chainId)
        // TOD0 check with ilja if we need unsupported flag
        config.emitter.emit('change', { chainId: normalizeChainId(chainId) })

        return chain
      } catch (error) {
        if (error instanceof Error) {
          throw new SwitchChainError(error)
        }
        throw error
      }
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.onDisconnect()
      } else {
        config.emitter.emit('change', { accounts: accounts.map(getAddress) })
      }
    },
    onChainChanged(chain) {
      const chainId = normalizeChainId(chain)
      config.emitter.emit('change', { chainId })
    },
    async onConnect(connectInfo) {
      const chainId = normalizeChainId(connectInfo.chainId)
      const accounts = await this.getAccounts()
      config.emitter.emit('connect', { accounts, chainId })
    },
    async onDisconnect(_error) {
      const provider = await this.getProvider()
      await provider.disconnect()
    },
    async getWalletClient() {
      const provider = await this.getProvider()
      const { address, chainId } = await provider.connect()

      return Promise.resolve(
        createWalletClient({
          account: address as `0x${string}`,
          chain: { id: chainId } as Chain,
          transport: custom(provider)
        })
      )
    },
    chains: config.chains
  }))
}
