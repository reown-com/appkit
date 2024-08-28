import { serializePublicKey, type P256Credential } from 'webauthn-p256'
import { type PrivateKeyAccount, type WalletClient } from 'viem'
import { useContext } from 'react'
import { ERC7715PermissionsContext } from '../context/ERC7715PermissionsContext'
import {
  decodeUncompressedPublicKey,
  encodePublicKeyToDID,
  hexStringToBase64
} from '../utils/EncodingUtils'
import { type GrantPermissionsReturnType, type WalletActionsErc7715 } from 'viem/experimental'
import { getSampleAsyncPermissions, getSampleSyncPermissions } from '../utils/ERC7715Utils'
import { WalletConnectCosigner } from '../utils/WalletConnectCosignerUtils'
import type { PasskeyStorageType } from '../context/PasskeyContext'

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

  async function requestPermissionsAsync(
    walletClient: WalletClient & WalletActionsErc7715,
    signer: PrivateKeyAccount
  ): Promise<RequestPermissionsReturnType> {
    if (!signer) {
      throw new Error('PrivateKey signer not available')
    }
    const accountAddress = walletClient.account?.address
    if (!accountAddress) {
      throw new Error('Account address not available')
    }
    const chain = walletClient.chain
    const caip10Address = `eip155:${chain?.id}:${accountAddress}`
    const walletConnectCosigner = new WalletConnectCosigner()
    const addPermissionResponse = await walletConnectCosigner.addPermission(caip10Address, {
      permissionType: 'donut-purchase',
      data: '',
      onChainValidated: false,
      required: true
    })

    setWCCosignerData(addPermissionResponse)
    const cosignerPublicKey = decodeUncompressedPublicKey(addPermissionResponse.key)

    const dAppECDSAPublicKey = signer.publicKey
    const dAppSecp256k1DID = encodePublicKeyToDID(dAppECDSAPublicKey, 'secp256k1')
    const coSignerSecp256k1DID = encodePublicKeyToDID(cosignerPublicKey, 'secp256k1')
    const samplePermissions = getSampleAsyncPermissions([coSignerSecp256k1DID, dAppSecp256k1DID])
    const approvedPermissions = await walletClient.grantPermissions(samplePermissions)
    await walletConnectCosigner.updatePermissionsContext(caip10Address, {
      pci: addPermissionResponse.pci,
      context: {
        expiry: approvedPermissions.expiry,
        signer: {
          type: 'donut-purchase',
          data: {
            ids: [addPermissionResponse.key, hexStringToBase64(dAppECDSAPublicKey)]
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

  async function requestPermissionsSync(
    walletClient: WalletClient & WalletActionsErc7715,
    passkey: PasskeyStorageType
  ): Promise<RequestPermissionsReturnType> {
    if (!passkey) {
      throw new Error('Passkey not available')
    }
    const accountAddress = walletClient.account?.address
    if (!accountAddress) {
      throw new Error('Account address not available')
    }
    const chain = walletClient.chain
    const caip10Address = `eip155:${chain?.id}:${accountAddress}`
    const walletConnectCosigner = new WalletConnectCosigner()
    const addPermissionResponse = await walletConnectCosigner.addPermission(caip10Address, {
      permissionType: 'donut-purchase',
      data: '',
      onChainValidated: false,
      required: true
    })

    setWCCosignerData(addPermissionResponse)
    const cosignerPublicKey = decodeUncompressedPublicKey(addPermissionResponse.key)
    let p = passkey as P256Credential
    p = {
      ...p,
      publicKey: {
        prefix: p.publicKey.prefix,
        x: BigInt(p.publicKey.x),
        y: BigInt(p.publicKey.y)
      }
    }
    const passkeyPublicKey = serializePublicKey(p.publicKey, { to: 'hex' })
    const passkeyDID = encodePublicKeyToDID(passkeyPublicKey, 'secp256r1')
    const secp256k1DID = encodePublicKeyToDID(cosignerPublicKey, 'secp256k1')
    const samplePermissions = getSampleSyncPermissions(secp256k1DID, passkeyDID)
    const approvedPermissions = await walletClient.grantPermissions(samplePermissions)
    await walletConnectCosigner.updatePermissionsContext(caip10Address, {
      pci: addPermissionResponse.pci,
      context: {
        expiry: approvedPermissions.expiry,
        signer: {
          type: 'donut-purchase',
          data: {
            ids: [addPermissionResponse.key, hexStringToBase64(passkeyPublicKey)]
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
    requestPermissionsAsync,
    requestPermissionsSync
  }
}
