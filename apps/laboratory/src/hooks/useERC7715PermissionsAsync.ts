import { type GrantPermissionsReturnType } from 'viem/experimental'
import { ENTRYPOINT_ADDRESS_V07, getUserOperationHash } from 'permissionless'
import { type UserOperation } from 'permissionless/types'
import { type PublicClient } from 'viem'
import { type Chain } from 'wagmi/chains'
import { useUserOpBuilder, type Execution } from './useUserOpBuilder'
import { bigIntReplacer } from '../utils/CommonUtils'
import { createClients } from '../utils/PermissionsUtils'
import { useWalletConnectCosigner } from './useWalletConnectCosigner'
import { signMessage } from 'viem/accounts'
import { useWagmiPermissionsAsync } from '../context/WagmiPermissionsAsyncContext'

export function useERC7715PermissionsAsync() {
  const { getCallDataWithContext, getNonceWithContext } = useUserOpBuilder()
  const { coSignUserOperation } = useWalletConnectCosigner()
  const { wcCosignerData } = useWagmiPermissionsAsync()

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

  async function signUserOperationWithECDSAKey(args: {
    ecdsaPrivateKey: `0x${string}`
    userOp: UserOperation<'v0.7'>
    permissions: GrantPermissionsReturnType
    chain: Chain
  }): Promise<`0x${string}`> {
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
    const dappSignatureOnUserOp = await signMessage({
      privateKey: ecdsaPrivateKey,
      message: { raw: userOpHash }
    })

    return dappSignatureOnUserOp
  }

  async function executeActionsWithECDSAAndCosignerPermissions(args: {
    ecdsaPrivateKey: `0x${string}`
    permissions: GrantPermissionsReturnType
    actions: Execution[]
    chain: Chain
  }): Promise<`0x${string}`> {
    const { ecdsaPrivateKey, permissions, actions, chain } = args
    const accountAddress = permissions?.signerData?.submitToAddress
    const { publicClient, bundlerClient } = createClients(chain)
    const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']

    if (!accountAddress) {
      throw new Error(`Unable to get account details from granted permission`)
    }
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

    const signature = await signUserOperationWithECDSAKey({
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

    const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
      hash: txHash.userOperationTxHash as `0x${string}`
    })

    return userOpReceipt.receipt.transactionHash
  }

  return {
    executeActionsWithECDSAAndCosignerPermissions
  }
}
