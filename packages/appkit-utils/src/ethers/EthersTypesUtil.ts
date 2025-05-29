import type { ProviderInterface } from '@coinbase/wallet-sdk'
import type { SafeAppProvider } from '@safe-global/safe-apps-provider'
import type UniversalProvider from '@walletconnect/universal-provider'

import type { W3mFrameProvider } from '@reown/appkit-wallet'

import type { SocialProvider } from '../TypeUtil.js'

export interface IEthersConfig {
  providers: ProviderType
  defaultChain?: number
  SSR?: boolean
}

export type Address = `0x${string}`

export type ProviderType = {
  injected?: Provider
  coinbase?: ProviderInterface
  safe?: SafeAppProvider
  auth?: {
    email?: boolean
    socials?: SocialProvider[]
    showWallets?: boolean
    walletFeatures?: boolean
  }
  EIP6963?: boolean
  metadata: Metadata
}

export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

type ProviderEventListener = {
  connect: (connectParams: { chainId: number }) => void
  disconnect: (error: Error) => void
  chainChanged: (chainId: string) => void
  accountsChanged: (accounts: string[]) => void
  message: (message: { type: string; data: unknown }) => void
}

export interface Provider {
  request: <T>(args: RequestArguments) => Promise<T>
  on<T extends keyof ProviderEventListener>(event: T, listener: ProviderEventListener[T]): void
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

export type UniversalProviderType = UniversalProvider & W3mFrameProvider & Provider

export type Chain = {
  id: string | number
  chainId: string | number
  name: string
  currency: string
  explorerUrl: string
  rpcUrl: string
  chain: string
  imageId: string | undefined
}
