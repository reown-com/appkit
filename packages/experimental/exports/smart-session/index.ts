import { SmartSessionsController } from '../../src/smart-session/controllers/SmartSessionsController.js'
import type {
  SmartSession,
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse
} from '../../src/smart-session/utils/TypeUtils.js'
export * from '../../src/smart-session/utils/TypeUtils.js'

// Views
export * from '../../src/smart-session/ui/views/w3m-smart-session-created-view/index.js'
export * from '../../src/smart-session/ui/views/w3m-smart-session-list-view/index.js'
export * from '../../src/smart-session/ui/permissions/wui-permission-contract-call/index.js'

// Controller handlers
export async function grantPermissions(
  request: SmartSessionGrantPermissionsRequest
): Promise<SmartSessionGrantPermissionsResponse> {
  return SmartSessionsController.grantPermissions(request)
}

export async function getSmartSessions() {
  return SmartSessionsController.getSmartSessions()
}

export async function revokeSmartSession(session: SmartSession) {
  return SmartSessionsController.revokeSmartSession(session)
}

export function isSmartSessionSupported() {
  return SmartSessionsController.isSmartSessionSupported()
}
