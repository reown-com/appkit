import '@web3modal/polyfills'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { ethers } from 'ethers'
import type { EthereumProviderOptions } from 'node_modules/@walletconnect/ethereum-provider/dist/types/EthereumProvider.js'
import type { ProviderType } from './types.js'

type ArrayOneOrMore<T> = {
  0: T
} & T[]

export interface ConfigOptions {
  projectId: string
  chains?: number[]
  optionalChains: ArrayOneOrMore<number>
}

export async function defaultEthersConfig({ projectId, chains, optionalChains }: ConfigOptions) {
  const walletConnectProviderOptions: EthereumProviderOptions = {
    projectId,
    showQrModal: false,
    chains,
    optionalChains
  }

  const walletConnectProvider = await EthereumProvider.init(walletConnectProviderOptions)

  const providers: ProviderType = {}

  providers.walletConnect = new ethers.providers.Web3Provider(walletConnectProvider, 'any')

  if (window.ethereum) {
    providers.injected = new ethers.providers.Web3Provider(window.ethereum, 'any')
  }

  return providers
}
