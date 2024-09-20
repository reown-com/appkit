import { ChainController, ConnectionController, OptionsController } from '@reown/appkit-core'
import { KeyTypes } from './core/helper/index.js'
import type {
  Signer,
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse,
  WalletGrantPermissionsResponse
} from './core/utils/TypeUtils.js'
import { WalletConnectCosigner } from './core/utils/WalletConnectCosigner'

const ERROR_MESSAGES = {
  UNSUPPORTED_NAMESPACE: 'Unsupported namespace',
  NO_RESPONSE_RECEIVED: 'No response received from grantPermissions'
}

// Utility function for error logging
function logError(context: string, error: unknown) {
  console.error(`${context}:`, error)
}

// -- Client -------------------------------------------------------------------- //
// Constants for error messages
export class AppKitSmartSessionControllerClient {
  async grantPermissions(
    request: SmartSessionGrantPermissionsRequest
  ): Promise<SmartSessionGrantPermissionsResponse> {
    try {
      const projectId = OptionsController.state.projectId
      const { activeCaipAddress } = ChainController.state

      const address =
        activeCaipAddress && activeCaipAddress.startsWith('eip155:') ? activeCaipAddress : ''
      if (!address) throw new Error(ERROR_MESSAGES.UNSUPPORTED_NAMESPACE)

      this.validateSigner(request.signer)

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
      logError('Error during grantPermissions process', error)
      throw error
    }
  }

  private getCosignerKey(publicKey: `0x${string}`): { type: KeyTypes; publicKey: `0x${string}` } {
    return { type: KeyTypes.secp256k1, publicKey }
  }

  private updateRequestSigner(
    request: SmartSessionGrantPermissionsRequest,
    cosignerKey: { type: KeyTypes; publicKey: `0x${string}` }
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

  private validateSigner(signer: Signer) {
    switch (signer.type) {
      case 'wallet':
        // No additional validation needed for wallet signers
        break
      case 'key':
        if (!signer.data.publicKey) {
          throw new Error('A public key is required for key signers.')
        }
        break
      case 'keys':
        if (!signer.data.keys || signer.data.keys.length === 0) {
          throw new Error('A set of public keys is required for multisig signers.')
        }
        break
      case 'account':
        if (!signer.data.address) {
          throw new Error('An address is required for account signers.')
        }
        break
      default:
        throw new Error(`Unsupported signer : ${signer}`)
    }
  }
}
