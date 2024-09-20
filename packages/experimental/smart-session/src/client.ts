import { ChainController, ConnectionController, CoreHelperUtil } from '@reown/appkit-core'
import {
  decodeDIDToPublicKey,
  decodeUncompressedPublicKey,
  encodePublicKeyToDID,
  hexStringToBase64,
  KeyTypes
} from './core/helper/index.js'
import type {
  // SmartSessionClientMethods,
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse,
  WalletGrantPermissionsResponse
} from './core/utils/TypeUtils.js'
import { WalletConnectCosigner } from './core/utils/WalletConnectCosignerUtils.js'

// -- Client -------------------------------------------------------------------- //
export class AppKitSmartSessionControllerClient {
  async grantPermissions(
    smartSessionGrantPermissionsRequest: SmartSessionGrantPermissionsRequest
  ): Promise<SmartSessionGrantPermissionsResponse> {
    const { signer } = smartSessionGrantPermissionsRequest
    const caipAddress = ChainController.state.activeCaipAddress
    const address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : ''
    if (!address) {
      throw new Error('An address is required create Smart Session.')
    }
    const caipNetwork = ChainController.state.activeCaipNetwork

    if (!caipNetwork?.id) {
      throw new Error('A chainId is required to create Smart Session.')
    }

    if (signer.type !== 'key' && signer.type !== 'keys' && signer.data['id']) {
      throw new Error('Invalid signer type')
    }

    const dAppKey = decodeDIDToPublicKey(signer.data['id'])
    if (!dAppKey) {
      throw new Error('Invalid dAppKey signer data')
    }
    const dAppKeyDID = encodePublicKeyToDID(dAppKey.key, dAppKey.keyType)
    const caip10Address = `eip155:${caipNetwork.id}:${address}`
    const walletConnectCosigner = new WalletConnectCosigner()
    const addPermissionResponse = await walletConnectCosigner.addPermission(caip10Address, {
      permissionType: 'donut-purchase',
      data: '',
      onChainValidated: false,
      required: true
    })
    const cosignerPublicKey = decodeUncompressedPublicKey(addPermissionResponse.key)
    const cosignerKeyDID = encodePublicKeyToDID(cosignerPublicKey, KeyTypes.secp256k1)
    smartSessionGrantPermissionsRequest.signer = {
      type: 'keys',
      data: {
        ids: [cosignerKeyDID, dAppKeyDID]
      }
    }

    const connectionControllerClient = ConnectionController._getClient('eip155')

    const smartSessionGrantPermissionsResponse = (await connectionControllerClient.grantPermissions(
      smartSessionGrantPermissionsRequest
    )) as WalletGrantPermissionsResponse

    if (!smartSessionGrantPermissionsResponse) {
      throw new Error(
        'AppKitSmartSessionControllerClient:grantPermissions - smartSessionGrantPermissionsResponse is undefined'
      )
    }

    //TODO: Cosigner activate Permissions call
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

    return {
      permissions: smartSessionGrantPermissionsResponse.permissions,
      context: smartSessionGrantPermissionsResponse.context
    }
  }
}
