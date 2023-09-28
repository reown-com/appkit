import '@web3modal/polyfills'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { ethers } from 'ethers'
import type { EthereumProviderOptions } from 'node_modules/@walletconnect/ethereum-provider/dist/types/EthereumProvider.js'
import type { ProviderType } from './types.js'

export interface ConfigOptions {
  projectId: string
}

export async function defaultEthersConfig({ projectId }: ConfigOptions) {
  const walletConnectProviderOptions: EthereumProviderOptions = {
    projectId,
    showQrModal: false,
    chains: [1],
    optionalChains: [42161, 137, 43114, 56, 10, 100, 324, 7777777, 8453, 42220, 1313161554]
  }

  const walletConnectProvider = await EthereumProvider.init(walletConnectProviderOptions)

  const providers: ProviderType = {}

  providers.walletConnect = new ethers.providers.Web3Provider(walletConnectProvider, 'any')

  if (window.ethereum) {
    providers.injected = new ethers.providers.Web3Provider(window.ethereum, 'any')
  }

  return providers
}
