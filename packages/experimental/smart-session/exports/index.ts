import { AppKitSmartSessionControllerClient } from '../src/client.js'

export { SmartSessionController } from '../src/core/controller/SmartSessionController.js'
export type {
  KeyType,
  KeySigner,
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse
} from '../src/core/utils/TypeUtils.js'
export type { AppKitSmartSessionControllerClient }

export { useSmartSession } from '../src/hooks/useSmartSession.js'
