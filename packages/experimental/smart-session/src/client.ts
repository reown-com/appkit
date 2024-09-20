import {
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  OptionsController
} from '@reown/appkit-core'
import {
  decodeDIDToPublicKey,
  decodeUncompressedPublicKey,
  encodePublicKeyToDID,
  hexStringToBase64,
  KeyTypes
} from './core/helper/index.js'
import type {
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse,
  WalletGrantPermissionsResponse
} from './core/utils/TypeUtils.js'
import { WalletConnectCosigner } from './core/utils/WalletConnectCosigner'

// -- Client -------------------------------------------------------------------- //
export class AppKitSmartSessionControllerClient {
  async grantPermissions(
    smartSessionGrantPermissionsRequest: SmartSessionGrantPermissionsRequest
  ): Promise<SmartSessionGrantPermissionsResponse> {
    try {
      const { signer } = smartSessionGrantPermissionsRequest
      const { activeCaipAddress, activeCaipNetwork } = ChainController.state

      // Validate address and network
      const address = activeCaipAddress ? CoreHelperUtil.getPlainAddress(activeCaipAddress) : ''
      if (!address) throw new Error('An address is required to create a Smart Session.')

      if (!activeCaipNetwork?.id)
        throw new Error('A chainId is required to create a Smart Session.')

      // Validate signer type
      if (signer.type !== 'key' && signer.type !== 'keys' && signer.data['id']) {
        throw new Error('Invalid signer type.')
      }

      // Decode dAppKey and generate DID
      const dAppKey = decodeDIDToPublicKey(signer.data['id'])
      if (!dAppKey) throw new Error('Invalid dAppKey signer data.')

      const dAppKeyDID = encodePublicKeyToDID(dAppKey.key, dAppKey.keyType)
      const caip10Address = `${activeCaipNetwork.id}:${address}`
      const projectId = OptionsController.state.projectId
      // Add permission using WalletConnect cosigner
      const walletConnectCosigner = new WalletConnectCosigner(projectId)
      const addPermissionResponse = await walletConnectCosigner.addPermission(caip10Address, {
        permissionType: 'donut-purchase',
        data: '',
        onChainValidated: false,
        required: true
      })

      // Decode cosigner key and generate DID
      const cosignerPublicKey = decodeUncompressedPublicKey(addPermissionResponse.key)
      const cosignerKeyDID = encodePublicKeyToDID(cosignerPublicKey, KeyTypes.secp256k1)

      // Update request with cosigner info
      smartSessionGrantPermissionsRequest.signer = {
        type: 'keys',
        data: {
          ids: [cosignerKeyDID, dAppKeyDID]
        }
      }

      // Call the connection controller to process the grant permission
      const connectionControllerClient = ConnectionController._getClient('eip155')
      const smartSessionGrantPermissionsResponse =
        (await connectionControllerClient.grantPermissions(
          smartSessionGrantPermissionsRequest
        )) as WalletGrantPermissionsResponse

      if (!smartSessionGrantPermissionsResponse) {
        throw new Error(
          'AppKitSmartSessionControllerClient:grantPermissions - No response received from grantPermissions'
        )
      }

      // Update the cosigner permissions context
      await walletConnectCosigner.updatePermissionsContext(caip10Address, {
        pci: addPermissionResponse.pci,
        context: {
          expiry: smartSessionGrantPermissionsResponse.expiry,
          signer: {
            type: 'donut-purchase',
            data: {
              ids: [addPermissionResponse.key, hexStringToBase64(dAppKey.key)]
            }
          },
          signerData: {
            userOpBuilder: smartSessionGrantPermissionsResponse.signerMeta?.userOpBuilder || ''
          },
          permissionsContext: smartSessionGrantPermissionsResponse.context,
          factory: smartSessionGrantPermissionsResponse.accountMeta?.factory || '',
          factoryData: smartSessionGrantPermissionsResponse.accountMeta?.factoryData || ''
        }
      })

      return smartSessionGrantPermissionsResponse
    } catch (error) {
      console.error('Error during grantPermissions process:', error)
      throw error
    }
  }
}
