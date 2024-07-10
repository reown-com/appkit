import { type GrantPermissionsReturnType } from 'viem/experimental'
import {
  ENTRYPOINT_ADDRESS_V07,
  getPackedUserOperation,
  getUserOperationHash
} from 'permissionless'
import { type UserOperation } from 'permissionless/types'
import { signatureToHex, type PublicClient } from 'viem'
import { type Chain } from 'wagmi/chains'
import { sign } from 'viem/accounts'
import { useUserOpBuilder, type Execution } from './useUserOpBuilder'
import { bigIntReplacer } from '../utils/CommonUtils'
import { createClients } from '../utils/PermissionsUtils'

export function usePermissions() {
  const { getCallDataWithContext, getNonceWithContext, getSignatureWithContext } =
    useUserOpBuilder()

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
      callGasLimit: BigInt(2000000),
      verificationGasLimit: BigInt(2000000),
      preVerificationGas: BigInt(2000000),
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
      userOperation: userOp,
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      chainId: chain.id
    })

    const dappSignatureOnUserOp = await sign({
      privateKey: ecdsaPrivateKey,
      hash: userOpHash
    })
    const rawSignature = signatureToHex(dappSignatureOnUserOp)
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

  return {
    buildAndSendTransactionsECDSAKeyAndPermissions
  }
}
