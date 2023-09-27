import { ethers } from 'ethers'

export interface IEthersConfig {
  providers: ProviderType
  defaultChain?: number
  SSR?: boolean
}

export type Address = `0x${string}`

export type ProviderType = {
  injected?: ethers.providers.Web3Provider
  walletConnect?: ethers.providers.Web3Provider
}
