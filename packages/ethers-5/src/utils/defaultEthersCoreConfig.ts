import '@web3modal/polyfills'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { ethers } from 'ethers'
import type { EthereumProviderOptions } from 'node_modules/@walletconnect/ethereum-provider/dist/types/EthereumProvider.js'
import type { ExternalProvider, ProviderType } from './types.js'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

type ArrayOneOrMore<T> = {
  0: T
} & T[]

export interface ConfigOptions {
  projectId: string
  chains?: number[]
  optionalChains: ArrayOneOrMore<number>
  enableEIP6963?: boolean
}

export async function defaultEthersConfig({
  projectId,
  chains,
  optionalChains,
  enableEIP6963
}: ConfigOptions) {
  const walletConnectProviderOptions: EthereumProviderOptions = {
    projectId,
    showQrModal: false,
    chains,
    optionalChains
  }

  const walletConnectProvider = await EthereumProvider.init(walletConnectProviderOptions)

  const providers: ProviderType = {}

  const coinbaseWallet = new CoinbaseWalletSDK({
    appName: 'Web3Modal',
    appLogoUrl: 'https://avatars.githubusercontent.com/u/37784886',
    darkMode: false
  })

  const coinbaseProvider = coinbaseWallet.makeWeb3Provider(
    'https://cloudflare-eth.com',
    1
  ) as unknown as ExternalProvider

  providers.coinbase = new ethers.providers.Web3Provider(coinbaseProvider, 'any')

  providers.walletConnect = new ethers.providers.Web3Provider(walletConnectProvider, 'any')

  if (window.ethereum) {
    providers.injected = new ethers.providers.Web3Provider(window.ethereum, 'any')
  }

  if (enableEIP6963) {
    providers.EIP6963 = true
  }

  return providers
}
