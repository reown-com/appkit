import { ChainController, ConnectionController, OptionsController } from '@reown/appkit-core'
import type {
  KeyType,
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse,
  WalletGrantPermissionsResponse
} from './core/utils/TypeUtils.js'
import { WalletConnectCosigner } from './core/utils/WalletConnectCosigner'
import { ERROR_MESSAGES, validateRequest, validateSigner } from './core/helper/index.js'

// -- Client -------------------------------------------------------------------- //
// Constants for error messages
export class AppKitSmartSessionControllerClient {
  async grantPermissions(
    request: SmartSessionGrantPermissionsRequest
  ): Promise<SmartSessionGrantPermissionsResponse> {
    try {
      validateRequest(request)
      const projectId = OptionsController.state.projectId
      const { activeCaipAddress } = ChainController.state

      const address =
        activeCaipAddress && activeCaipAddress.startsWith('eip155:') ? activeCaipAddress : ''
      if (!address) throw new Error(ERROR_MESSAGES.UNSUPPORTED_NAMESPACE)

      validateSigner(request.signer)

      const walletConnectCosigner = new WalletConnectCosigner(projectId)
      const addPermissionResponse = await walletConnectCosigner.addPermission(address, request)

      const cosignerKey = this.getCosignerKey(addPermissionResponse.key)
      this.updateRequestSigner(request, cosignerKey)

      const connectionControllerClient = ConnectionController._getClient('eip155')
      const response = (await connectionControllerClient.grantPermissions(
        request
      )) as WalletGrantPermissionsResponse

      if (!response) {
        throw new Error(ERROR_MESSAGES.NO_RESPONSE_RECEIVED)
      }

      await walletConnectCosigner.activatePermissions(address, {
        pci: addPermissionResponse.pci,
        ...response
      })

      return {
        permissions: response.permissions,
        context: response.context
      }
    } catch (error) {
      throw error
    }
  }

  private getCosignerKey(publicKey: `0x${string}`): { type: KeyType; publicKey: `0x${string}` } {
    return { type: 'secp256k1', publicKey }
  }

  private updateRequestSigner(
    request: SmartSessionGrantPermissionsRequest,
    cosignerKey: { type: KeyType; publicKey: `0x${string}` }
  ) {
    const dAppKey = request.signer.type === 'key' ? request.signer.data : undefined

    if (dAppKey && cosignerKey) {
      request.signer = {
        type: 'keys',
        data: { keys: [cosignerKey, dAppKey] }
      }
    }
    return request
  }
}
