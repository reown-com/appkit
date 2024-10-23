import type { CaipNetworkId } from '@reown/appkit-common'

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXConfig {
  createMessage: (input: SIWXMessageInput) => Promise<SIWXMessage>
  addSession: (session: SIWXSession) => Promise<void>
  revokeSession: (chainId: string, address: string) => Promise<void>
  setSessions: (sessions: SIWXSession[]) => Promise<void>
  getSessions: (chainId: CaipNetworkId) => Promise<SIWXSession[]>
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
export interface SIWXMessage
  extends SIWXMessageInput,
    SIWXMessageMetadata,
    SIWXMessageIdentifier,
    SIWXMessageMethods {}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXMessageInput {
  accountAddress: string
  chainId: string
  notBefore?: SIWXMessageTimestamp
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXMessageMetadata {
  domain: string
  uri: string
  version: string
  nonce: string
  statement?: string
  resources?: string[]
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXMessageIdentifier {
  requestId?: string
  issuedAt?: SIWXMessageTimestamp
  expirationTime?: SIWXMessageTimestamp
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXMessageMethods {
  toString: () => string
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export type SIWXMessageTimestamp = string
