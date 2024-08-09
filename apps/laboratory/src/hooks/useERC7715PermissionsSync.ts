import { type GrantPermissionsReturnType } from 'viem/experimental'
import { ENTRYPOINT_ADDRESS_V07, getUserOperationHash } from 'permissionless'
import { type UserOperation } from 'permissionless/types'
import { encodeAbiParameters, hashMessage, type PublicClient } from 'viem'
import { sign as signWithPasskey } from 'webauthn-p256'
import { type Chain } from 'wagmi/chains'
import { useUserOpBuilder, type Execution } from './useUserOpBuilder'
import { bigIntReplacer } from '../utils/CommonUtils'
import { createClients } from '../utils/PermissionsUtils'
import { useWalletConnectCosigner, type AddPermissionResponse } from './useWalletConnectCosigner'

export function useERC7715PermissionsSync(params: {
  projectId: string
  permissions: GrantPermissionsReturnType | undefined
  chain: Chain
}) {
  const { projectId, permissions, chain } = params
  const { getCallDataWithContext, getNonceWithContext } = useUserOpBuilder()
  const accountAddress = permissions?.signerData?.submitToAddress
  const caip10Address = `eip155:${chain?.id}:${accountAddress}`
  const { coSignUserOperation } = useWalletConnectCosigner(caip10Address, projectId)

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

  async function executeActionsWithPasskeyAndCosignerPermissions(args: {
    actions: Execution[]
    passkeyId: string
    wcCosignerData: AddPermissionResponse
  }): Promise<`0x${string}`> {
    const { actions, passkeyId, wcCosignerData } = args
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
    const txHash = await coSignUserOperation({
      pci: wcCosignerData.pci,
      userOp
    })

    const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
      hash: txHash.userOperationTxHash as `0x${string}`
    })

    return userOpReceipt.receipt.transactionHash
  }

  return {
    executeActionsWithPasskeyAndCosignerPermissions
  }
}
