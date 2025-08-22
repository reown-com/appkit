import type { CaipNetwork, CaipNetworkId, ChainNamespace, Connection } from '@reown/appkit-common'

export interface ConnectionContext {
  connections: Record<ChainNamespace, Connection[]>
  activeCaipNetworkId: CaipNetworkId | null
  networks: CaipNetwork[]
}

export type ConnectionEvent =
  | {
      type: 'CONNECT_REQUEST'
    }
  | {
      type: 'CONNECT_SUCCESS'
    }
  | {
      type: 'CONNECT_FAILURE'
    }
  | {
      type: 'DISCONNECT'
    }
  | {
      type: 'AUTHENTICATION_REQUEST'
    }
  | {
      type: 'AUTHENTICATION_APPROVED'
    }
  | {
      type: 'AUTHENTICATION_REJECTED'
    }
  | {
      type: 'AUTHENTICATION_SUCCESS'
    }
  | {
      type: 'AUTHENTICATION_FAILURE'
    }
/*
 * User events
 * | { type: 'SELECT_TOKEN'; token: Balance }
 */

/*
 * XState service completion events
 * | { type: 'xstate.done.actor.ensResolver'; output: ENSResolutionOutput }
 * XState service error events
 * | { type: 'xstate.error.actor.ensResolver'; error: Error }
 */
