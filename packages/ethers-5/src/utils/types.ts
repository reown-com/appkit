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
  coinbase?: ethers.providers.Web3Provider
  EIP6963?: boolean
}

export type ExternalProvider = {
  isMetaMask?: boolean
  isStatus?: boolean
  host?: string
  path?: string
  sendAsync?: (
    request: { method: string; params?: unknown[] },
    callback: (error: unknown, response: unknown) => void
  ) => void
  send?: (
    request: { method: string; params?: unknown[] },
    callback: (error: unknown, response: unknown) => void
  ) => void
  request?: (request: { method: string; params?: unknown[] }) => Promise<unknown>
}
