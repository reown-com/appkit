import { AppKitSmartSessionControllerClient } from '../src/client.js'
import type {
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse
} from '../src/core/utils/TypeUtils.js'
export {
  SmartSessionController,
  type SmartSessionControllerClient
} from '../src/core/controller/SmartSessionController.js'
export * from '../src/core/utils/TypeUtils.js'
export type { AppKitSmartSessionControllerClient }

// -- Hooks -------------------------------------------------------------------
export function useSmartSession() {
  async function grantPermissions(
    request: SmartSessionGrantPermissionsRequest
  ): Promise<SmartSessionGrantPermissionsResponse> {
    const appkitSmartSessionControllerClient = new AppKitSmartSessionControllerClient()
    return await appkitSmartSessionControllerClient.grantPermissions(request)
  }

  return {
    grantPermissions
  }
}
