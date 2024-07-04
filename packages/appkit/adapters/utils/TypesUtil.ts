import type { W3mFrameProvider } from '@web3modal/wallet'

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

export type CombinedProvider = W3mFrameProvider & Provider

export type Status = 'reconnecting' | 'connected' | 'disconnected'
