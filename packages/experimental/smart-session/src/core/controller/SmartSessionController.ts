import type { ChainAdapter } from '@reown/appkit-core'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import type {
  SmartSessionClientMethods,
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse
} from '../utils/TypeUtils'

// -- Types --------------------------------------------- //
export interface SmartSessionControllerClient extends SmartSessionClientMethods {
  chainAdapter: ChainAdapter
}

export interface SmartSessionControllerClientState {
  _client?: SmartSessionControllerClient
}

type StateKey = keyof SmartSessionControllerClientState

// -- State --------------------------------------------- //
const state = proxy<SmartSessionControllerClientState>({
  // status: 'uninitialized'
})

// -- Controller ---------------------------------------- //
export const SmartSessionController = {
  state,

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: SmartSessionControllerClientState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: SmartSessionControllerClientState) => void) {
    return sub(state, () => callback(state))
  },

  _getClient() {
    if (!state._client) {
      throw new Error('SmartSessionControllerClientState client not set')
    }

    return state._client
  },

  setSmartSessionControllerClient(client: SmartSessionControllerClient) {
    state._client = ref(client)
  },

  grantPermissions(
    request: SmartSessionGrantPermissionsRequest
  ): Promise<SmartSessionGrantPermissionsResponse> {
    return this._getClient().grantPermissions(request)
  }
}
