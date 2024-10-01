import { ChainController, ConnectionController, OptionsController } from '@reown/appkit-core'
import type {
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse
} from './utils/TypeUtils.js'
import {
  assertWalletGrantPermissionsResponse,
  extractAddress,
  updateRequestSigner,
  validateRequest
} from './helper/index.js'
import { CosignerService } from './utils/CosignerService.js'
import { ERROR_MESSAGES } from './schema/index.js'

/**
 * Grants permissions to a user's wallet.
 * @param request SmartSessionGrantPermissionsRequest
 * @returns SmartSessionGrantPermissionsResponse
 *
 */
export async function grantPermissions(
  request: SmartSessionGrantPermissionsRequest
): Promise<SmartSessionGrantPermissionsResponse> {
  validateRequest(request)

  // Retrieve state values
  const { projectId } = OptionsController.state
  const { activeCaipAddress } = ChainController.state

  // Ensure the namespace is supported and extract address
  const address = extractAddress(activeCaipAddress)
  if (!activeCaipAddress || !address) {
    throw new Error(ERROR_MESSAGES.INVALID_ADDRESS)
  }

  // Instantiate CosignerService and process permissions
  const cosignerService = new CosignerService(projectId)
  const addPermissionResponse = await cosignerService.addPermission(activeCaipAddress, request)

  // Update request signer with the cosigner key
  updateRequestSigner(request, {
    type: 'secp256k1',
    publicKey: addPermissionResponse.key.publicKey
  })

  // Fetch the ConnectionController client and grant permissions
  const connectionControllerClient = ConnectionController._getClient('eip155')
  const rawResponse = await connectionControllerClient.grantPermissions(request)

  // Validate and type guard the response
  const response = assertWalletGrantPermissionsResponse(rawResponse)

  // Activate the permissions using CosignerService
  await cosignerService.activatePermissions(activeCaipAddress, {
    pci: addPermissionResponse.pci,
    ...response
  })

  // Return the permissions granted and the context
  return {
    permissions: response.permissions,
    context: addPermissionResponse.pci,
    expiry: response.expiry,
    address: response.address || address,
    chainId: response.chainId
  }
}
