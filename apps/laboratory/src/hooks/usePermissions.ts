import { type GrantPermissionsReturnType } from 'viem/experimental'
import {
  ENTRYPOINT_ADDRESS_V07,
  getPackedUserOperation,
  getUserOperationHash
} from 'permissionless'
import { type UserOperation } from 'permissionless/types'
import {
  encodeAbiParameters,
  encodePacked,
  hashMessage,
  serializeSignature,
  verifyMessage,
  type PublicClient
} from 'viem'
import { sign as signWithPasskey, verify, type P256Credential } from 'webauthn-p256'
import { type Chain } from 'wagmi/chains'
import { privateKeyToAccount, sign, signMessage } from 'viem/accounts'
import { useUserOpBuilder, type Execution } from './useUserOpBuilder'
import { bigIntReplacer } from '../utils/CommonUtils'
import { createClients } from '../utils/PermissionsUtils'
import usePasskey from './usePasskey'

export function usePermissions() {
  const { getCallDataWithContext, getNonceWithContext, getSignatureWithContext } =
    useUserOpBuilder()
  const { passkeyId, passKey } = usePasskey()

  async function prepareUserOperationWithPermissions(
    publicClient: PublicClient,
    args: {
      actions: Execution[]
      permissions: GrantPermissionsReturnType
    }
  ): Promise<UserOperation<'v0.7'>> {
    const { permissions, actions } = args
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
      callGasLimit: BigInt(6000000),
      verificationGasLimit: BigInt(6000000),
      preVerificationGas: BigInt(6000000),
      maxFeePerGas: BigInt(0),
      maxPriorityFeePerGas: BigInt(0),
      signature: '0x'
    }

    return userOp
  }

  async function signUserOperationWithECDSAKeyAndPermissions(
    publicClient: PublicClient,
    args: {
      ecdsaPrivateKey: `0x${string}`
      userOp: UserOperation<'v0.7'>
      permissions: GrantPermissionsReturnType
      chain: Chain
    }
  ): Promise<`0x${string}`> {
    const { ecdsaPrivateKey, userOp, chain, permissions } = args

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

    const dappSignatureOnUserOp = await sign({
      privateKey: ecdsaPrivateKey,
      hash: userOpHash
    })

    const rawSignature = serializeSignature(dappSignatureOnUserOp)
    userOp.signature = rawSignature
    const preSignaturePackedUserOp = getPackedUserOperation(userOp)

    const signatureWithContext = await getSignatureWithContext(publicClient, {
      sender: signerData.submitToAddress,
      permissionsContext: permissionsContext as `0x${string}`,
      userOperation: preSignaturePackedUserOp,
      userOpBuilderAddress: signerData.userOpBuilder
    })

    return signatureWithContext
  }

  async function signUserOperationWithPasskeyAndCosigner(
    publicClient: PublicClient,
    args: {
      ecdsaPrivateKey: `0x${string}`
      userOp: UserOperation<'v0.7'>
      permissions: GrantPermissionsReturnType
      chain: Chain
    }
  ): Promise<`0x${string}`> {
    const { ecdsaPrivateKey, userOp, chain, permissions } = args

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
    const cosignerSignatureOnUserOp = await signMessage({
      privateKey: ecdsaPrivateKey,
      message: { raw: userOpHash }
    })
    console.log({ cosignerSignatureOnUserOp })
    const coSignerAccount = privateKeyToAccount(ecdsaPrivateKey)

    const cosignerSignatureValid = await verifyMessage({
      address: coSignerAccount.address,
      message: { raw: userOpHash },
      signature: cosignerSignatureOnUserOp
    })
    console.log({ cosignerSignatureValid })

    const ethMessageUserOpHash = hashMessage({ raw: userOpHash })

    const usersPasskeySignature = await signWithPasskey({
      credentialId: passkeyId,
      hash: ethMessageUserOpHash
    })

    const verifyResult = await verify({
      hash: ethMessageUserOpHash,
      signature: usersPasskeySignature.signature,
      webauthn: usersPasskeySignature.webauthn,
      publicKey: {
        prefix: (passKey as P256Credential).publicKey.prefix,
        x: BigInt((passKey as P256Credential).publicKey.x),
        y: BigInt((passKey as P256Credential).publicKey.y)
      }
    })
    console.log({ passkeySignatureVerificatioResult: verifyResult })

    console.log({ usersPasskeySignature })
    const authenticatorData = usersPasskeySignature.webauthn.authenticatorData
    const clientDataJSON = usersPasskeySignature.webauthn.clientDataJSON
    const responseTypeLocation = usersPasskeySignature.webauthn.typeIndex
    const userVerificationRequired = usersPasskeySignature.webauthn.userVerificationRequired
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
      [authenticatorData, clientDataJSON, responseTypeLocation, r, s, userVerificationRequired]
    )
    console.log({ passkeySignature })
    userOp.signature = encodePacked(
      ['bytes', 'bytes'],
      [cosignerSignatureOnUserOp, passkeySignature]
    )
    const preSignaturePackedUserOp = getPackedUserOperation(userOp)
    console.log({ preSignaturePackedUserOp })
    const signatureWithContext = await getSignatureWithContext(publicClient, {
      sender: signerData.submitToAddress,
      permissionsContext: permissionsContext as `0x${string}`,
      userOperation: preSignaturePackedUserOp,
      userOpBuilderAddress: signerData.userOpBuilder
    })

    return signatureWithContext
  }

  async function buildAndSendTransactionsECDSAKeyAndPermissions(args: {
    ecdsaPrivateKey: `0x${string}`
    permissions: GrantPermissionsReturnType
    actions: Execution[]
    chain: Chain
  }): Promise<`0x${string}`> {
    const { ecdsaPrivateKey, permissions, actions, chain } = args

    const { publicClient, bundlerClient } = createClients(chain)

    const userOp = await prepareUserOperationWithPermissions(publicClient, {
      actions,
      permissions
    })

    const gasPrice = await bundlerClient.getUserOperationGasPrice()
    userOp.maxFeePerGas = gasPrice.fast.maxFeePerGas
    userOp.maxPriorityFeePerGas = gasPrice.fast.maxPriorityFeePerGas

    const signature = await signUserOperationWithECDSAKeyAndPermissions(publicClient, {
      permissions,
      ecdsaPrivateKey,
      userOp,
      chain
    })

    userOp.signature = signature
    /**
     *  Const packedUserOp = getPackedUserOperation(userOp)
     *  console.log('Final Packed UserOp to send', JSON.stringify(packedUserOp, bigIntReplacer))
     */

    const _userOpHash = await bundlerClient.sendUserOperation({
      userOperation: userOp
    })

    const txReceipt = await bundlerClient.waitForUserOperationReceipt({
      hash: _userOpHash,
      timeout: 30000
    })

    return txReceipt.receipt.transactionHash
  }

  async function buildAndSendTransactionsWithCosignerAndPermissions(args: {
    ecdsaPrivateKey: `0x${string}`
    permissions: GrantPermissionsReturnType
    actions: Execution[]
    chain: Chain
  }): Promise<`0x${string}`> {
    const { ecdsaPrivateKey, permissions, actions, chain } = args

    const { publicClient, bundlerClient } = createClients(chain)

    const userOp = await prepareUserOperationWithPermissions(publicClient, {
      actions,
      permissions
    })

    const gasPrice = await bundlerClient.getUserOperationGasPrice()
    userOp.maxFeePerGas = gasPrice.fast.maxFeePerGas
    userOp.maxPriorityFeePerGas = gasPrice.fast.maxPriorityFeePerGas

    const signature = await signUserOperationWithPasskeyAndCosigner(publicClient, {
      permissions,
      ecdsaPrivateKey,
      userOp,
      chain
    })

    userOp.signature = signature

    const packedUserOp = getPackedUserOperation(userOp)
    console.log('Final Packed UserOp to send', JSON.stringify(packedUserOp, bigIntReplacer))

    const _userOpHash = await bundlerClient.sendUserOperation({
      userOperation: userOp
    })

    const txReceipt = await bundlerClient.waitForUserOperationReceipt({
      hash: _userOpHash,
      timeout: 30000
    })

    return txReceipt.receipt.transactionHash
  }

  return {
    buildAndSendTransactionsECDSAKeyAndPermissions,
    buildAndSendTransactionsWithCosignerAndPermissions
  }
}
