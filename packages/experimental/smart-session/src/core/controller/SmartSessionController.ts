import { proxy, subscribe as sub } from 'valtio/vanilla'
import type {
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse
} from '../utils/TypeUtils'
import { AppKitSmartSessionControllerClient } from '../../client'

// -- Types --------------------------------------------- //
export interface SmartSessionControllerState {
  permissionsContext?: SmartSessionGrantPermissionsResponse['context']
  permissions?: SmartSessionGrantPermissionsResponse['permissions']
}

export type StateKey = keyof SmartSessionControllerState

// -- State --------------------------------------------------------- //
const state = proxy<SmartSessionControllerState>({
  permissions: undefined,
  permissionsContext: undefined
})

// -- Controller ---------------------------------------- //
export const SmartSessionController = {
  state,

  async grantPermissions(
    smartSessionGrantPermissionsRequest: SmartSessionGrantPermissionsRequest
  ): Promise<SmartSessionGrantPermissionsResponse> {
    const client = new AppKitSmartSessionControllerClient()
    const response = await client.grantPermissions(smartSessionGrantPermissionsRequest)

    this.setPermissions(response.permissions)
    this.setPermissionsContext(response.context)

    return response
  },

  subscribe(callback: (newState: SmartSessionControllerState) => void) {
    return sub(state, () => callback(state))
  },

  setPermissions(permissions: SmartSessionGrantPermissionsResponse['permissions']) {
    state.permissions = permissions
  },

  setPermissionsContext(context: SmartSessionGrantPermissionsResponse['context']) {
    state.permissionsContext = context
  }
}
