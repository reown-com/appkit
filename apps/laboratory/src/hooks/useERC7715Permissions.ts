import { ENTRYPOINT_ADDRESS_V07, getUserOperationHash } from 'permissionless'
import { type UserOperation } from 'permissionless/types'
import { serializePublicKey, sign as signWithPasskey, type P256Credential } from 'webauthn-p256'
import {
  encodeAbiParameters,
  hashMessage,
  type PrivateKeyAccount,
  type PublicClient,
  type WalletClient
} from 'viem'
import { type Chain } from 'wagmi/chains'
import { bigIntReplacer } from '../utils/CommonUtils'
import { createClients } from '../utils/PermissionsUtils'
import { signMessage } from 'viem/accounts'
import { useContext } from 'react'
import { ERC7715PermissionsContext } from '../context/ERC7715PermissionsContext'
import {
  getCallDataWithContext,
  getNonceWithContext,
  type Execution
} from '../utils/UserOpBuilderUtils'
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

export function useERC7715Permissions(params: { chain: Chain }) {
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

  const accountAddress = permissions?.signerData?.submitToAddress
  const caip10Address = `eip155:${chain?.id}:${accountAddress}`

  async function prepareUserOperationWithPermissions(
    publicClient: PublicClient,
    actions: Execution[]
  ): Promise<UserOperation<'v0.7'>> {
    if (!permissions) {
      throw new Error('No permissions available')
    }
    const { factory, factoryData, signerData, permissionsContext } = permissions

    if (!signerData?.userOpBuilder || !signerData.submitToAddress || !permissionsContext) {
      throw new Error(`Invalid permissions ${JSON.stringify(permissions, bigIntReplacer)}`)
    }

    const nonce = await getNonceWithContext(publicClient, {
      userOpBuilderAddress: signerData.userOpBuilder,
      sender: signerData.submitToAddress,
      permissionsContext: permissionsContext as `0x${string}`
    })

    const callData = await getCallDataWithContext(publicClient, {
      userOpBuilderAddress: signerData.userOpBuilder,
      sender: signerData.submitToAddress,
      permissionsContext: permissionsContext as `0x${string}`,
      actions
    })

    const userOp: UserOperation<'v0.7'> = {
      sender: signerData.submitToAddress,
      factory,
      factoryData: factoryData ? (factoryData as `0x${string}`) : undefined,
      nonce,
      callData,
      callGasLimit: BigInt(2000000),
      verificationGasLimit: BigInt(2000000),
      preVerificationGas: BigInt(2000000),
      maxFeePerGas: BigInt(0),
      maxPriorityFeePerGas: BigInt(0),
      signature: '0x'
    }

    return userOp
  }

  async function signUserOperationWithPasskey(args: {
    userOp: UserOperation<'v0.7'>
    passkeyId: string
  }): Promise<`0x${string}`> {
    const { userOp, passkeyId } = args
    if (!permissions) {
      throw new Error('No permissions available')
    }
    const { signerData, permissionsContext } = permissions

    if (!signerData?.userOpBuilder || !signerData.submitToAddress || !permissionsContext) {
      throw new Error(`Invalid permissions ${JSON.stringify(permissions, bigIntReplacer)}`)
    }
    const userOpHash = getUserOperationHash({
      userOperation: {
        ...userOp
      },
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      chainId: chain.id
    })
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
    userOp: UserOperation<'v0.7'>
  }): Promise<`0x${string}`> {
    const { ecdsaPrivateKey, userOp } = args
    if (!permissions) {
      throw new Error('No permissions available')
    }
    const { signerData, permissionsContext } = permissions

    if (!signerData?.userOpBuilder || !signerData.submitToAddress || !permissionsContext) {
      throw new Error(`Invalid permissions ${JSON.stringify(permissions, bigIntReplacer)}`)
    }
    const userOpHash = getUserOperationHash({
      userOperation: userOp,
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      chainId: chain.id
    })
    const dappSignatureOnUserOp = await signMessage({
      privateKey: ecdsaPrivateKey,
      message: { raw: userOpHash }
    })

    return dappSignatureOnUserOp
  }

  async function executeActionsWithPasskeyAndCosignerPermissions(args: {
    actions: Execution[]
    passkeyId: string
  }): Promise<`0x${string}`> {
    const { actions, passkeyId } = args
    const { publicClient, bundlerClient } = createClients(chain)

    if (!accountAddress) {
      throw new Error(`Unable to get account details from granted permission`)
    }

    if (!wcCosignerData) {
      throw new Error('No WC_COSIGNER data available')
    }

    const userOp = await prepareUserOperationWithPermissions(publicClient, actions)

    const gasPrice = await bundlerClient.getUserOperationGasPrice()
    userOp.maxFeePerGas = gasPrice.fast.maxFeePerGas
    userOp.maxPriorityFeePerGas = gasPrice.fast.maxPriorityFeePerGas

    const signature = await signUserOperationWithPasskey({
      userOp,
      passkeyId
    })

    userOp.signature = signature

    const walletConnectCosigner = new WalletConnectCosigner()
    const cosignResponse = await walletConnectCosigner.coSignUserOperation(caip10Address, {
      pci: wcCosignerData.pci,
      userOp
    })

    const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
      hash: cosignResponse.userOperationTxHash as `0x${string}`
    })

    return userOpReceipt.receipt.transactionHash
  }

  async function executeActionsWithECDSAAndCosignerPermissions(args: {
    actions: Execution[]
    ecdsaPrivateKey: `0x${string}`
  }): Promise<`0x${string}`> {
    const { ecdsaPrivateKey, actions } = args
    const { publicClient, bundlerClient } = createClients(chain)

    if (!accountAddress) {
      throw new Error(`Unable to get account details from granted permission`)
    }

    if (!wcCosignerData) {
      throw new Error('No WC_COSIGNER data available')
    }

    const userOp = await prepareUserOperationWithPermissions(publicClient, actions)

    const gasPrice = await bundlerClient.getUserOperationGasPrice()
    userOp.maxFeePerGas = gasPrice.fast.maxFeePerGas
    userOp.maxPriorityFeePerGas = gasPrice.fast.maxPriorityFeePerGas

    const signature = await signUserOperationWithECDSAKey({
      ecdsaPrivateKey,
      userOp
    })

    userOp.signature = signature
    const walletConnectCosigner = new WalletConnectCosigner()
    const cosignResponse = await walletConnectCosigner.coSignUserOperation(caip10Address, {
      pci: wcCosignerData.pci,
      userOp
    })

    const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
      hash: cosignResponse.userOperationTxHash as `0x${string}`
    })

    return userOpReceipt.receipt.transactionHash
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
  ): Promise<RequestPermissionsReturnType | ErrorResponse> {
    if (!passkey) {
      throw new Error('Passkey not available')
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
      if (approvedPermissions) {
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

      return { error: 'Request Permissions Error', message: 'Failed to obtain permissions' }
    } catch (error) {
      return {
        error: 'Request Permissions Error',
        message: error instanceof Error ? error.message : 'Some error occurred'
      }
    }
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
