import { type GrantPermissionsReturnType } from 'viem/experimental'
import {
  ENTRYPOINT_ADDRESS_V07,
  getPackedUserOperation,
  getUserOperationHash
} from 'permissionless'
import { type UserOperation } from 'permissionless/types'
import { encodeAbiParameters, hashMessage, type PublicClient } from 'viem'
import { sign as signWithPasskey } from 'webauthn-p256'
import { type Chain } from 'wagmi/chains'
import { useUserOpBuilder, type Execution } from './useUserOpBuilder'
import { bigIntReplacer } from '../utils/CommonUtils'
import { createClients } from '../utils/PermissionsUtils'
import usePasskey from './usePasskey'
import { useWalletConnectCosigner } from './useWalletConnectCosigner'
import { useGrantedPermissions } from './useGrantedPermissions'

export function usePermissions() {
  const { getCallDataWithContext, getNonceWithContext } = useUserOpBuilder()
  const { coSignUserOperation } = useWalletConnectCosigner()
  const { wcCosignerData } = useGrantedPermissions()
  const { passkeyId } = usePasskey()

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

    /*
     * Comment
     * const dummySignature = await getDummySignatureWithContext(publicClient, {
     *   userOpBuilderAddress: signerData.userOpBuilder,
     *   sender: signerData.submitToAddress,
     *   permissionsContext: permissionsContext as `0x${string}`,
     *   actions
     * })
     * console.log({ dummySignature })
     */
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

  async function signUserOperationWithPasskeyAndCosigner(
    publicClient: PublicClient,
    args: {
      ecdsaPrivateKey: `0x${string}`
      userOp: UserOperation<'v0.7'>
      permissions: GrantPermissionsReturnType
      chain: Chain
    }
  ): Promise<`0x${string}`> {
    const { userOp, chain, permissions } = args

    const { signerData, permissionsContext } = permissions

    if (!signerData?.userOpBuilder || !signerData.submitToAddress || !permissionsContext) {
      throw new Error(`Invalid permissions ${JSON.stringify(permissions, bigIntReplacer)}`)
    }
    const packedForEntryPoint = getPackedUserOperation(userOp)
    console.log({ packedForEntryPoint })
    const userOpHash = getUserOperationHash({
      userOperation: {
        ...userOp
      },
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      chainId: chain.id
    })
    console.log({ userOpHash })
    const ethMessageUserOpHash = hashMessage({ raw: userOpHash })
    // console.log({ prefixedMessage: toPrefixedMessage({ raw: userOpHash }) })
    // console.log({ ethMessageUserOpHash })
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

  async function buildAndSendTransactionsWithCosignerAndPermissions(args: {
    ecdsaPrivateKey: `0x${string}`
    permissions: GrantPermissionsReturnType
    actions: Execution[]
    chain: Chain
    accountAddress: `0x${string}`
  }): Promise<`0x${string}`> {
    const { ecdsaPrivateKey, permissions, actions, chain, accountAddress } = args

    const { publicClient, bundlerClient } = createClients(chain)
    const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
    }
    if (!wcCosignerData) {
      throw new Error('No WC_COSIGNER data available')
    }

    const caip10Address = `eip155:${chain?.id}:${accountAddress}`
    const userOp = await prepareUserOperationWithPermissions(publicClient, {
      actions,
      permissions
    })

    const gasPrice = await bundlerClient.getUserOperationGasPrice()
    userOp.maxFeePerGas = gasPrice.fast.maxFeePerGas
    userOp.maxPriorityFeePerGas = gasPrice.fast.maxPriorityFeePerGas

    /**
     * Comment
     * const pimlicoPaymasterClient = createPimlicoPaymasterClient({
     *   transport: http(getPaymasterUrl()),
     *  entryPoint: ENTRYPOINT_ADDRESS_V07,
     *   chain: sepolia
     *  })
     * const paymasterResponse = pimlicoPaymasterClient.sponsorUserOperation({
     *   userOperation: userOp
     * })
     * userOp = { ...userOp, ...paymasterResponse }
     * console.log({ userOp })
     */
    const signature = await signUserOperationWithPasskeyAndCosigner(publicClient, {
      permissions,
      ecdsaPrivateKey,
      userOp,
      chain
    })

    userOp.signature = signature
    const txHash = await coSignUserOperation(caip10Address, projectId, {
      pci: wcCosignerData.pci,
      userOp
    })

    return txHash.userOpReceipt as `0x${string}`
  }

  return {
    buildAndSendTransactionsWithCosignerAndPermissions
  }
}
