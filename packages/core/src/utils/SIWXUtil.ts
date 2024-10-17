/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SWIXConfig {
  createMessage: (chainId: string) => Promise<SIWXMessage>
  addSession: (session: SIWXSession) => Promise<void>
  revokeSession: (chainId: string, address: string) => Promise<void>
  setSessions: (sessions: SIWXSession[]) => Promise<void>
  getSessions: (chainId: string) => Promise<SIWXSession[]>
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXSession {
  message: SIWXMessage
  signature: string
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXMessage {
  chainId: string
  domain: string
  accountAddress: string
  uri: string
  version: string
  nonce: string

  statement?: string
  resources?: string[]
  issuedAt?: string
  expirationTime?: string
  notBefore?: string
  requestId?: string

  toString: () => string
}
