//@ts-nocheck
import { type CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import type { CoinbaseWalletSDKOptions } from '@coinbase/wallet-sdk/dist/CoinbaseWalletSDK.js'
import type { ProviderInterface } from '@coinbase/wallet-sdk/dist/core/type/ProviderInterface.js'
import { ChainNotConfiguredError, createConnector } from '@wagmi/core'
import {
  type ProviderRpcError,
  SwitchChainError,
  UserRejectedRequestError,
  getAddress,
  numberToHex
} from 'viem'

coinbaseWallet.type = 'coinbaseWallet' as const
export function coinbaseWallet(parameters: CoinbaseWalletSDKOptions) {
  type Properties = {}

  let sdk: CoinbaseWalletSDK | undefined
  let walletProvider: ProviderInterface | undefined

  return createConnector<ProviderInterface, Properties>(config => ({
    id: 'coinbaseWalletSDK',
    name: 'Coinbase Wallet',
    type: coinbaseWallet.type,
    async connect({ chainId } = {}) {
      try {
        const provider = await this.getProvider()
        const accounts = (
          (await provider.request({
            method: 'eth_requestAccounts'
          })) as string[]
        ).map(x => getAddress(x))

        provider.on('accountsChanged', this.onAccountsChanged)
        provider.on('chainChanged', this.onChainChanged)
        provider.on('disconnect', this.onDisconnect.bind(this))

        // Switch to chain if provided
        let currentChainId: number = await this.getChainId()
        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain!({ chainId }).catch(error => {
            if (error.code === UserRejectedRequestError.code) throw error
            return { id: currentChainId }
          })
          currentChainId = chain?.id ?? currentChainId
        }

        return { accounts, chainId: currentChainId }
      } catch (error) {
        if (
          /(user closed modal|accounts received is empty|user denied account)/i.test(
            (error as Error).message
          )
        )
          throw new UserRejectedRequestError(error as Error)
        throw error
      }
    },
    async disconnect() {
      const provider = await this.getProvider()

      provider.removeListener('accountsChanged', this.onAccountsChanged)
      provider.removeListener('chainChanged', this.onChainChanged)
      provider.removeListener('disconnect', this.onDisconnect.bind(this))

      provider?.disconnect?.() // non extension
      sdk?.disconnect?.() // calls legacy method extension.close if necessary
    },
    async getAccounts() {
      const provider = await this.getProvider()
      return (
        await provider.request<string[]>({
          method: 'eth_accounts'
        })
      ).map(x => getAddress(x))
    },
    async getChainId() {
      const provider = await this.getProvider()
      const chainId = await provider.request({ method: 'eth_chainId' })
      return Number(chainId)
    },
    async getProvider() {
      if (!walletProvider) {
        const { default: CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk')
        let SDK: typeof CoinbaseWalletSDK.default
        if (
          typeof CoinbaseWalletSDK !== 'function' &&
          typeof CoinbaseWalletSDK.default === 'function'
        )
          SDK = CoinbaseWalletSDK.default
        else SDK = CoinbaseWalletSDK as unknown as typeof CoinbaseWalletSDK.default
        sdk = new SDK(parameters)

        walletProvider = sdk.makeWeb3Provider() as ProviderInterface
      }

      return walletProvider as ProviderInterface
    },
    async isAuthorized() {
      try {
        const accounts = await this.getAccounts()
        return !!accounts.length
      } catch {
        return false
      }
    },
    async switchChain({ chainId }) {
      const chain = config.chains.find(chain => chain.id === chainId)
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())

      const provider = await this.getProvider()
      const chainId_ = numberToHex(chain.id)

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId_ }]
        })
        return chain
      } catch (error) {
        // Indicates chain is not added to provider
        if ((error as ProviderRpcError).code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chainId_,
                  chainName: chain.name,
                  nativeCurrency: chain.nativeCurrency,
                  rpcUrls: [chain.rpcUrls.default?.http[0] ?? ''],
                  blockExplorerUrls: [chain.blockExplorers?.default.url]
                }
              ]
            })
            return chain
          } catch (error) {
            throw new UserRejectedRequestError(error as Error)
          }
        }

        throw new SwitchChainError(error as Error)
      }
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) config.emitter.emit('disconnect')
      else
        config.emitter.emit('change', {
          accounts: accounts.map(x => getAddress(x))
        })
    },
    onChainChanged(chain) {
      const chainId = Number(chain)
      config.emitter.emit('change', { chainId })
    },
    async onDisconnect(_error) {
      config.emitter.emit('disconnect')

      const provider = await this.getProvider()
      provider.removeListener('accountsChanged', this.onAccountsChanged)
      provider.removeListener('chainChanged', this.onChainChanged)
      provider.removeListener('disconnect', this.onDisconnect.bind(this))
    }
  }))
}
