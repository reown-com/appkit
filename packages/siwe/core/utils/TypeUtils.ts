export interface SIWESession {
  address: string
  chainId: number
}

export interface SIWECreateMessageArgs {
  nonce: string
  address: string
  chainId: number
}

export interface SIWEVerifyMessageArgs {
  message: string
  signature: string
}

export interface SIWEClientMethods {
  getNonce: (address?: string) => Promise<string>
  createMessage: (args: SIWECreateMessageArgs) => string
  verifyMessage: (args: SIWEVerifyMessageArgs) => Promise<boolean>
  getSession: () => Promise<SIWESession | null>
  signOut: () => Promise<boolean>
  onSignIn?: (session?: SIWESession) => void
  onSignOut?: () => void
}

export interface SIWEConfig extends SIWEClientMethods {
  // Defaults to true
  enabled?: boolean
  // In milliseconds, defaults to 5 minutes
  nonceRefetchIntervalMs?: number
  // In milliseconds, defaults to 5 minutes
  sessionRefetchIntervalMs?: number
  // Defaults to true
  signOutOnDisconnect?: boolean
  // Defaults to true
  signOutOnAccountChange?: boolean
  // Defaults to true
  signOutOnNetworkChange?: boolean
}
