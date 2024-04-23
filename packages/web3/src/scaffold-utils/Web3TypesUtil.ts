// @TODO think about consolidating with packages/scaffold-utils/src/EthersTypesUtil.ts

import type { W3mFrameProvider } from '@web3modal/wallet'

export interface IWeb3Config {
  provider: ProviderType
  metadata: Metadata

  //  defaultChain?: number
  //  SSR?: boolean
}

export type Address = `0x${string}`

export type ProviderType = {
  injected?: Provider
  coinbase?: Provider
  email?: boolean
  EIP6963?: boolean
  metadata: Metadata
}

export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface Provider {
  request: <T>(args: RequestArguments) => Promise<T>
  on: <T>(event: string, listener: (data: T) => void) => void
  removeListener: <T>(event: string, listener: (data: T) => void) => void
  emit: (event: string) => void
}

export type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

export type CombinedProvider = W3mFrameProvider & Provider

// Note: the type below is the one used with ethers. The one next is the one used with viem.
// We want to support both. But we recommend using `Chain` instead of `SimpleChain`.

export type SimpleChain = {
  rpcUrl: string
  explorerUrl: string
  currency: string
  name: string
  chainId: number
}

export type Chain = {
  chainId: number
  blockExplorerUrls?: string[]
  chainName: string
  iconUrls?: string[]
  nativeCurrency: {
    decimals: number
    name?: string
    symbol: string
  }
  rpcUrls: string[]
}

export function ensureChainType(chains: Chain[] | SimpleChain[]): Chain[] {
  let consolidatedChains = chains.map(ch => {
    const asSimpleChain: Partial<SimpleChain> = ch as SimpleChain
    const chain = ch as Chain
    if (asSimpleChain.currency) {
      chain.nativeCurrency = {
        name: asSimpleChain.currency,
        decimals: 18,
        symbol: asSimpleChain.currency
      }
      delete asSimpleChain.currency
    }
    if (asSimpleChain.explorerUrl) {
      chain.blockExplorerUrls = [asSimpleChain.explorerUrl]
      delete asSimpleChain.explorerUrl
    }
    if (asSimpleChain.rpcUrl) {
      chain.rpcUrls = [asSimpleChain.rpcUrl]
      delete asSimpleChain.rpcUrl
    }
    if (asSimpleChain.name) {
      chain.chainName = asSimpleChain.name
      delete asSimpleChain.name
    }
    return chain
  })
  return consolidatedChains as Chain[]
}
