import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import type {
  CreateSIWEMessageArgs,
  SIWESession,
  VerifySIWEMessageArgs
} from '../utils/TypeUtil.js'

import { SIWEStatus } from '../utils/TypeUtil.js'

export interface SIWEControllerClient {
  // -- Required --------------------------------------------- //
  getNonce: () => Promise<string>
  createMessage: (args: CreateSIWEMessageArgs) => string
  verifyMessage: (args: VerifySIWEMessageArgs) => Promise<boolean>
  getSession: () => Promise<SIWESession | null>
  signOut: () => Promise<boolean>

  // -- Optional --------------------------------------------- //

  // Defaults true
  enabled?: boolean
  // In milliseconds, defaults to 5 minutes
  nonceRefetchInterval?: number
  // In milliseconds, defaults to 5 minutes
  sessionRefetchInterval?: number
  // Defaults true
  signOutOnDisconnect?: boolean
  // Defaults true
  signOutOnAccountChange?: boolean
  // Defaults true
  signOutOnNetworkChange?: boolean
  onSignIn?: (session?: SIWESession) => void
  onSignOut?: () => void
}

export interface SIWEControllerClientState {
  _client?: SIWEControllerClient
  nonce?: string
  session?: SIWESession
  message?: string
  status: SIWEStatus
}

type StateKey = keyof SIWEControllerClientState

// -- State --------------------------------------------- //
const state = proxy<SIWEControllerClientState>({
  status: SIWEStatus.UNINITIALIZED
})

// -- Controller ---------------------------------------- //
export const SIWEController = {
  state,

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: SIWEControllerClientState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: SIWEControllerClientState) => void) {
    return sub(state, () => callback(state))
  },

  setSIWEClient(client: SIWEControllerClientState['_client']) {
    state._client = client
    state.status = SIWEStatus.READY
  },

  setNonce(nonce: SIWEControllerClientState['nonce']) {
    state.nonce = nonce
  },

  setStatus(status: SIWEControllerClientState['status']) {
    state.status = status
  },

  setMessage(message: SIWEControllerClientState['message']) {
    state.message = message
  },

  setSession(session: SIWEControllerClientState['session']) {
    state.session = session
  }
}
