import { ChainController, ConnectionController, OptionsController } from '@reown/appkit-core'
import type {
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse,
  WalletGrantPermissionsResponse,
  KeyType
} from './utils/TypeUtils.js'
import { ERROR_MESSAGES, validateRequest, validateSigner } from './helper/index.js'
import { WalletConnectCosigner } from './utils/WalletConnectCosigner.js'

/*
 * -- Client -------------------------------------------------------------------- //
 */
export async function grantPermissions(
  request: SmartSessionGrantPermissionsRequest
): Promise<SmartSessionGrantPermissionsResponse> {
  validateRequest(request)
  const projectId = OptionsController.state.projectId
  const { activeCaipAddress } = ChainController.state

  const address = activeCaipAddress?.startsWith('eip155:') ? activeCaipAddress : ''
  if (!address) {
    throw new Error(ERROR_MESSAGES.UNSUPPORTED_NAMESPACE)
  }

  validateSigner(request.signer)

  const walletConnectCosigner = new WalletConnectCosigner(projectId)
  const addPermissionResponse = await walletConnectCosigner.addPermission(address, request)
  updateRequestSigner(request, {
    type: 'secp256k1',
    publicKey: addPermissionResponse.key.publicKey
  })

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
    context: addPermissionResponse.pci
  }
}

function updateRequestSigner(
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
