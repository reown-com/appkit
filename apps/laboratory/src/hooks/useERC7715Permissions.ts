import { serializePublicKey, sign as signWithPasskey, type P256Credential } from 'webauthn-p256'
import {
  encodeAbiParameters,
  hashMessage,
  type Address,
  type PrivateKeyAccount,
  type WalletClient
} from 'viem'
import { type Chain } from 'wagmi/chains'
import { bigIntReplacer } from '../utils/CommonUtils'
import { signMessage } from 'viem/accounts'
import { useContext } from 'react'
import { ERC7715PermissionsContext } from '../context/ERC7715PermissionsContext'
import { buildUserOp, type Call, type FillUserOpResponse } from '../utils/UserOpBuilderServiceUtils'
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

type ErrorResponse = {
  message: string
  error: string
}

export function useERC7715Permissions(params: { chain: Chain; address?: Address }) {
  const context = useContext(ERC7715PermissionsContext)

  if (context === undefined) {
    throw new Error('useERC7715Permissions must be used within a ERC7715PermissionsProvider')
  }
  const { chain } = params

  const {
    wcCosignerData,
    grantedPermissions: permissions,
    setWCCosignerData,
    setGrantedPermissions
  } = context

  const accountAddress = permissions?.signerData?.submitToAddress || params.address
  const caip10Address = `eip155:${chain?.id}:${accountAddress}`

  async function prepareUserOperationWithPermissions(actions: Call[]): Promise<FillUserOpResponse> {
    if (!permissions) {
      throw new Error('No permissions available')
    }
    const { signerData, permissionsContext } = permissions

    if (!signerData?.userOpBuilder || !signerData.submitToAddress || !permissionsContext) {
      throw new Error(`Invalid permissions ${JSON.stringify(permissions, bigIntReplacer)}`)
    }

    const filledUserOp = await buildUserOp({
      account: signerData.submitToAddress,
      chainId: chain.id,
      calls: actions,
      capabilities: {
        permissions: { context: permissionsContext as `0x${string}` }
      }
    })

    return filledUserOp
  }

  async function signUserOperationWithPasskey(args: {
    passkeyId: string
    userOpHash: `0x${string}`
  }): Promise<`0x${string}`> {
    const { userOpHash, passkeyId } = args
    if (!permissions) {
      throw new Error('No permissions available')
    }
    const { signerData, permissionsContext } = permissions

    if (!signerData?.userOpBuilder || !signerData.submitToAddress || !permissionsContext) {
      throw new Error(`Invalid permissions ${JSON.stringify(permissions, bigIntReplacer)}`)
    }

    const ethMessageUserOpHash = hashMessage({ raw: userOpHash })
    const usersPasskeySignature = await signWithPasskey({
      credentialId: passkeyId,
      hash: ethMessageUserOpHash
    })

    const authenticatorData = usersPasskeySignature.webauthn.authenticatorData
    const clientDataJSON = usersPasskeySignature.webauthn.clientDataJSON
    const responseTypeLocation = usersPasskeySignature.webauthn.typeIndex
    // Const userVerificationRequired = usersPasskeySignature.webauthn.userVerificationRequired
    const r = usersPasskeySignature.signature.r
    const s = usersPasskeySignature.signature.s

    const passkeySignature = encodeAbiParameters(
      [
        { type: 'bytes' },
        { type: 'string' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'bool' }
      ],
      [authenticatorData, clientDataJSON, responseTypeLocation, r, s, false]
    )

    return passkeySignature
  }

  async function signUserOperationWithECDSAKey(args: {
    ecdsaPrivateKey: `0x${string}`
    userOpHash: `0x${string}`
  }): Promise<`0x${string}`> {
    const { ecdsaPrivateKey, userOpHash } = args

    const dappSignatureOnUserOp = await signMessage({
      privateKey: ecdsaPrivateKey,
      message: { raw: userOpHash }
    })

    return dappSignatureOnUserOp
  }

  async function executeActionsWithPasskeyAndCosignerPermissions(args: {
    actions: Call[]
    passkeyId: string
  }): Promise<`0x${string}`> {
    const { actions, passkeyId } = args

    if (!accountAddress) {
      throw new Error(`Unable to get account details from granted permission`)
    }

    if (!wcCosignerData) {
      throw new Error('No WC_COSIGNER data available')
    }

    const filledUserOp = await prepareUserOperationWithPermissions(actions)
    const userOp = filledUserOp.userOp
    const signature = await signUserOperationWithPasskey({
      passkeyId,
      userOpHash: filledUserOp.hash
    })

    userOp.signature = signature

    const walletConnectCosigner = new WalletConnectCosigner()
    const cosignResponse = await walletConnectCosigner.coSignUserOperation(caip10Address, {
      pci: wcCosignerData.pci,
      userOp: {
        ...userOp,
        callData: userOp.callData,
        callGasLimit: BigInt(userOp.callGasLimit),
        nonce: BigInt(userOp.nonce),
        preVerificationGas: BigInt(userOp.preVerificationGas),
        verificationGasLimit: BigInt(userOp.verificationGasLimit),
        sender: userOp.sender,
        signature: userOp.signature,
        maxFeePerGas: BigInt(userOp.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas)
      }
    })

    return cosignResponse.userOperationTxHash as `0x${string}`
  }

  async function executeActionsWithECDSAAndCosignerPermissions(args: {
    actions: Call[]
    ecdsaPrivateKey: `0x${string}`
  }): Promise<`0x${string}`> {
    const { ecdsaPrivateKey, actions } = args

    if (!accountAddress) {
      throw new Error(`Unable to get account details from granted permission`)
    }

    if (!wcCosignerData) {
      throw new Error('No WC_COSIGNER data available')
    }

    const filledUserOp = await prepareUserOperationWithPermissions(actions)
    const userOp = filledUserOp.userOp

    const dappSignature = await signUserOperationWithECDSAKey({
      ecdsaPrivateKey,
      userOpHash: filledUserOp.hash
    })

    userOp.signature = dappSignature
    const walletConnectCosigner = new WalletConnectCosigner()
    const cosignResponse = await walletConnectCosigner.coSignUserOperation(caip10Address, {
      pci: wcCosignerData.pci,
      userOp: {
        ...userOp,
        callData: userOp.callData,
        callGasLimit: BigInt(userOp.callGasLimit),
        nonce: BigInt(userOp.nonce),
        preVerificationGas: BigInt(userOp.preVerificationGas),
        verificationGasLimit: BigInt(userOp.verificationGasLimit),
        sender: userOp.sender,
        signature: userOp.signature,
        maxFeePerGas: BigInt(userOp.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas)
      }
    })

    return cosignResponse.userOperationTxHash as `0x${string}`
  }

  async function requestPermissionsAsync(
    walletClient: WalletClient & WalletActionsErc7715,
    signer: PrivateKeyAccount
  ): Promise<RequestPermissionsReturnType | ErrorResponse> {
    if (!signer) {
      throw new Error('PrivateKey signer not available')
    }

    try {
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
      if (approvedPermissions) {
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

      return { error: 'Request Permissions Error', message: 'Failed to obtain permissions' }
    } catch (error) {
      return {
        error: 'Request Permissions Error',
        message: error instanceof Error ? error.message : 'Some error occurred'
      }
    }
  }

  async function requestPermissionsSync(
    walletClient: WalletClient & WalletActionsErc7715,
    passkey: PasskeyStorageType
  ): Promise<RequestPermissionsReturnType> {
    if (!passkey) {
      throw new Error('Passkey not available')
    }
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
    grantedPermissions: context.grantedPermissions,
    clearGrantedPermissions: context.clearGrantedPermissions,
    executeActionsWithECDSAAndCosignerPermissions,
    executeActionsWithPasskeyAndCosignerPermissions,
    requestPermissionsAsync,
    requestPermissionsSync
  }
}
