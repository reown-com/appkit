import { type Hex, type WalletClient } from 'viem'
import { useContext } from 'react'
import { ERC7715PermissionsContext } from '../context/ERC7715PermissionsContext'
import {
  decodeUncompressedPublicKey,
  encodePublicKeyToDID,
  hexStringToBase64,
  KeyTypes
} from '../utils/EncodingUtils'
import {
  type GrantPermissionsParameters,
  type GrantPermissionsReturnType,
  type WalletActionsErc7715
} from 'viem/experimental'
import { WalletConnectCosigner } from '../utils/WalletConnectCosignerUtils'

type RequestPermissionsReturnType = {
  approvedPermissions: GrantPermissionsReturnType
}

export function useERC7715Permissions() {
  const context = useContext(ERC7715PermissionsContext)

  if (context === undefined) {
    throw new Error('useERC7715Permissions must be used within a ERC7715PermissionsProvider')
  }

  const {
    grantedPermissions,
    wcCosignerData,
    setWCCosignerData,
    setGrantedPermissions,
    clearGrantedPermissions
  } = context

  async function requestPermissions(
    walletClient: WalletClient & WalletActionsErc7715,
    args: {
      permissions: GrantPermissionsParameters
      signerKey: {
        key: Hex
        type: KeyTypes
      }
    }
  ): Promise<RequestPermissionsReturnType> {
    const { permissions, signerKey } = args
    const accountAddress = walletClient.account?.address
    if (!accountAddress) {
      throw new Error('Account address not available')
    }
    const chain = walletClient.chain
    if (!chain) {
      throw new Error('Chain not available')
    }
    if (!signerKey) {
      throw new Error('Invalid signer data')
    }
    const dAppKeyDID = encodePublicKeyToDID(signerKey.key, signerKey.type)

    const caip10Address = `eip155:${chain.id}:${accountAddress}`
    const walletConnectCosigner = new WalletConnectCosigner()
    const addPermissionResponse = await walletConnectCosigner.addPermission(caip10Address, {
      permissionType: 'donut-purchase',
      data: '',
      onChainValidated: false,
      required: true
    })

    setWCCosignerData(addPermissionResponse)
    const cosignerPublicKey = decodeUncompressedPublicKey(addPermissionResponse.key)
    const cosignerKeyDID = encodePublicKeyToDID(cosignerPublicKey, KeyTypes.secp256k1)
    permissions.signer = {
      type: 'keys',
      data: {
        ids: [cosignerKeyDID, dAppKeyDID]
      }
    }
    const approvedPermissions = await walletClient.grantPermissions(permissions)
    await walletConnectCosigner.updatePermissionsContext(caip10Address, {
      pci: addPermissionResponse.pci,
      context: {
        expiry: approvedPermissions.expiry,
        signer: {
          type: 'donut-purchase',
          data: {
            ids: [addPermissionResponse.key, hexStringToBase64(signerKey.key)]
          }
        },
        signerData: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
          userOpBuilder: approvedPermissions.signerData?.userOpBuilder!
        },
        permissionsContext: approvedPermissions.permissionsContext,
        factory: approvedPermissions.factory || '',
        factoryData: approvedPermissions.factoryData || ''
      }
    })
    setGrantedPermissions(approvedPermissions)

    return { approvedPermissions }
  }

  return {
    grantedPermissions,
    pci: wcCosignerData?.pci,
    clearGrantedPermissions,
    requestPermissions
  }
}
