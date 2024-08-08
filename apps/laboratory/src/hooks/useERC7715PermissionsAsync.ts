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

export function useERC7715PermissionsAsync(params: {
  projectId: string
  permissions: GrantPermissionsReturnType | undefined
  chain: Chain
}) {
  const { projectId, permissions, chain } = params
  const { getCallDataWithContext, getNonceWithContext } = useUserOpBuilder()
  const { wcCosignerData } = useWagmiPermissionsAsync()
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

  async function executeActionsWithECDSAAndCosignerPermissions(args: {
    ecdsaPrivateKey: `0x${string}`
    actions: Execution[]
    chain: Chain
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
    executeActionsWithECDSAAndCosignerPermissions
  }
}
