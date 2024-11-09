import type { CaipNetworkId } from '@reown/appkit-common'

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXConfig {
  createMessage: (input: SIWXMessage.Input) => Promise<SIWXMessage>
  addSession: (session: SIWXSession) => Promise<void>
  revokeSession: (chainId: CaipNetworkId, address: string) => Promise<void>
  setSessions: (sessions: SIWXSession[]) => Promise<void>
  getSessions: (chainId: CaipNetworkId, address: string) => Promise<SIWXSession[]>
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXSession {
  data: SIWXMessage.Data
  message: string
  signature: string
  cacao?: Cacao
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXMessage extends SIWXMessage.Data, SIWXMessage.Methods {}

export namespace SIWXMessage {
  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export interface Data extends Input, Metadata, Identifier {}

  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export interface Input {
    accountAddress: string
    chainId: string
    notBefore?: Timestamp
  }

  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export interface Metadata {
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
  export interface Identifier {
    requestId?: string
    issuedAt?: Timestamp
    expirationTime?: Timestamp
  }

  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export interface Methods {
    toString: () => string
  }

  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export type Timestamp = string
}

export interface Cacao {
  h: Cacao.Header
  p: Cacao.Payload
  s: {
    t: 'eip191' | 'eip1271'
    s: string
    m?: string
  }
}

export namespace Cacao {
  export interface Header {
    t: 'caip122'
  }

  export interface Payload {
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
}
