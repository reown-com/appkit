import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface SIWESession {
  address: string
  chainId: number
}

export interface CreateSiweMessageArgs {
  nonce: string
  address: string
  chainId: number
}

export interface VerifySiweMessageArgs {
  message: string
  signature: string
}

// eslint-disable-next-line no-shadow
export enum StatusState {
  UNINITIALIZED = 'uninitialized',
  READY = 'ready',
  LOADING = 'loading',
  SUCCESS = 'success',
  REJECTED = 'rejected',
  ERROR = 'error'
}

export interface SiweControllerClient {
  // -- Required --------------------------------------------- //
  getNonce: () => Promise<string>
  createMessage: (args: CreateSiweMessageArgs) => string
  verifyMessage: (args: VerifySiweMessageArgs) => Promise<boolean>
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

export interface SiweControllerClientState {
  _client?: SiweControllerClient
  nonce?: string
  session?: SIWESession
  message?: string
  status: StatusState
}

type StateKey = keyof SiweControllerClientState

// -- State --------------------------------------------- //
const state = proxy<SiweControllerClientState>({
  status: StatusState.UNINITIALIZED
})

// -- Controller ---------------------------------------- //
export const SiweController = {
  state,

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: SiweControllerClientState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  setSiweClient(client: SiweControllerClientState['_client']) {
    state._client = client
    state.status = StatusState.READY
  },

  setNonce(nonce: SiweControllerClientState['nonce']) {
    state.nonce = nonce
  },

  setStatus(status: SiweControllerClientState['status']) {
    state.status = status
  },

  setMessage(message: SiweControllerClientState['message']) {
    state.message = message
  },

  setSession(session: SiweControllerClientState['session']) {
    state.session = session
  }
}
