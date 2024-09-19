import type {
  SmartSessionClientMethods,
  SmartSessionGrantPermissionsRequest
} from './core/utils/TypeUtils.js'

// -- Client -------------------------------------------------------------------- //
export class AppKitSmartSessionControllerClient {
  // public options: SmartSessionControllerClient['options']

  public methods: SmartSessionClientMethods

  public constructor(methods: SmartSessionClientMethods) {
    this.methods = methods
  }

  async grantPermissions(smartSessionGrantPermissionsRequest: SmartSessionGrantPermissionsRequest) {
    const smartSessionGrantPermissionsResponse = await this.methods.grantPermissions(
      smartSessionGrantPermissionsRequest
    )
    if (!smartSessionGrantPermissionsResponse) {
      throw new Error(
        'AppKitSmartSessionControllerClient:grantPermissions - smartSessionGrantPermissionsResponse is undefined'
      )
    }

    return smartSessionGrantPermissionsResponse
  }
}
