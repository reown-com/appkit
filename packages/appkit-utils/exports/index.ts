import type UniversalProvider from '@walletconnect/universal-provider'

import type { W3mFrameProvider } from '@reown/appkit-wallet'

export { ConstantsUtil } from '../src/ConstantsUtil.js'
export { PresetsUtil } from '../src/PresetsUtil.js'
export { HelpersUtil } from '../src/HelpersUtil.js'
export { SemVerUtils } from '../src/SemVerUtils.js'
export { ErrorUtil } from '../src/ErrorUtil.js'
export { TokenUtil } from '../src/TokenUtil.js'
export { LoggerUtil } from '../src/LoggerUtil.js'
export { CaipNetworksUtil, getBlockchainApiRpcUrl } from '../src/CaipNetworkUtil.js'
export type { SocialProvider } from '../src/TypeUtil.js'

export { SocialProviderEnum } from '../src/TypeUtil.js'

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

export type UniversalProviderType = UniversalProvider & W3mFrameProvider & Provider
