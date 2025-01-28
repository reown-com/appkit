import type { SIWEStatus } from '@reown/appkit-common'

export interface SIWESession {
  address: string
  chainId: number
}
interface CacaoHeader {
  t: 'caip122'
}
export interface SIWECreateMessageArgs {
  chainId: number
  domain: string
  nonce: string
  uri: string
  address: string
  version: '1'
  type?: CacaoHeader['t']
  nbf?: string
  exp?: string
  statement?: string
  requestId?: string
  resources?: string[]
  expiry?: number
  iat?: string
}
export type SIWEMessageArgs = {
  chains: number[]
  methods?: string[]
} & Omit<SIWECreateMessageArgs, 'address' | 'chainId' | 'nonce' | 'version'>
interface CacaoPayload {
  domain: string
  aud: string
  nonce: string
  iss: string
  version?: string
  iat?: string
  nbf?: string
  exp?: string
  statement?: string
  requestId?: string
  resources?: string[]
  type?: string
}
interface Cacao {
  h: CacaoHeader
  p: CacaoPayload
  s: {
    t: 'eip191' | 'eip1271'
    s: string
    m?: string
  }
}
export interface SIWEVerifyMessageArgs {
  message: string
  signature: string
  cacao?: Cacao
}
export interface SIWEClientMethods {
  getNonce: (address?: string) => Promise<string>
  getMessageParams?: () => Promise<SIWEMessageArgs>
  createMessage: (args: SIWECreateMessageArgs) => string
  verifyMessage: (args: SIWEVerifyMessageArgs) => Promise<boolean>
  getSession: () => Promise<SIWESession | null>
  signOut: () => Promise<boolean>
  onSignIn?: (session?: SIWESession) => void
  onSignOut?: () => void
}
export interface SIWEConfig extends SIWEClientMethods {
  required?: boolean
  enabled?: boolean
  nonceRefetchIntervalMs?: number
  sessionRefetchIntervalMs?: number
  signOutOnDisconnect?: boolean
  signOutOnAccountChange?: boolean
  signOutOnNetworkChange?: boolean
}
export {}

export interface SIWEControllerClient extends SIWEClientMethods {
  signIn: () => Promise<SIWESession>
  options: {
    required?: boolean
    enabled: boolean
    nonceRefetchIntervalMs: number
    sessionRefetchIntervalMs: number
    signOutOnDisconnect: boolean
    signOutOnAccountChange: boolean
    signOutOnNetworkChange: boolean
  }
}
export interface SIWEControllerClientState {
  _client?: SIWEControllerClient
  nonce?: string
  session?: SIWESession
  message?: string
  status: SIWEStatus
}
export declare const SIWEController: {
  state: SIWEControllerClientState
  subscribeKey<K extends keyof SIWEControllerClientState>(
    key: K,
    callback: (value: SIWEControllerClientState[K]) => void
  ): () => void
  subscribe(callback: (newState: SIWEControllerClientState) => void): () => void
  _getClient(): SIWEControllerClient
  getNonce(address?: string): Promise<string>
  getSession(): Promise<SIWESession | undefined>
  createMessage(args: SIWECreateMessageArgs): string
  verifyMessage(args: SIWEVerifyMessageArgs): Promise<boolean>
  signIn(): Promise<SIWESession>
  signOut(): Promise<void>
  onSignIn(args: SIWESession): void
  onSignOut(): void
  setSIWEClient(client: SIWEControllerClient): Promise<void>
  setNonce(nonce: SIWEControllerClientState['nonce']): void
  setStatus(status: SIWEControllerClientState['status']): void
  setMessage(message: SIWEControllerClientState['message']): void
  setSession(session: SIWEControllerClientState['session']): void
}

export declare class AppKitSIWEClient {
  options: SIWEControllerClient['options']
  methods: SIWEClientMethods
  constructor(siweConfig: SIWEConfig)
  mapToSIWX(): import('@reown/appkit-core').SIWXConfig
  getNonce(address?: string): Promise<string>
  getMessageParams?(): Promise<SIWEMessageArgs>
  createMessage(args: SIWECreateMessageArgs): string
  verifyMessage(args: SIWEVerifyMessageArgs): Promise<boolean>
  getSession(): Promise<SIWESession>
  signIn(): Promise<SIWESession>
  signOut(): Promise<boolean>
}
