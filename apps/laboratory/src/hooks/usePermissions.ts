import { type GrantPermissionsReturnType } from 'viem/experimental'
import {
  ENTRYPOINT_ADDRESS_V07,
  createBundlerClient,
  getPackedUserOperation,
  getUserOperationHash
} from 'permissionless'
import { pimlicoBundlerActions, pimlicoPaymasterActions } from 'permissionless/actions/pimlico'
import { type UserOperation } from 'permissionless/types'
import { createPublicClient, http, signatureToHex } from 'viem'
import { useLocalSigner } from './useLocalSigner'
import { sepolia, foundry } from 'wagmi/chains'
import type { Chain } from 'wagmi/chains'
import { sign } from 'viem/accounts'
import { useUserOpBuilder, type Execution } from './useUserOpBuilder'
import { bigIntReplacer } from '../utils/CommonUtils'

export function usePermissions(chain: Chain) {
  const { getCallDataWithContext, getNonceWithContext, getSignatureWithContext } =
    useUserOpBuilder()
  const { signer, signerPrivateKey } = useLocalSigner()
  async function buildAndSendTransactionsWithPermissions(
    grantedPermissionsResponse: GrantPermissionsReturnType,
    actions: Execution[]
  ): Promise<`0x${string}`> {
    try {
      if (!signerPrivateKey || !signer) {
        throw new Error('No dapp signer key available.')
      }
      let bundlerUrl = ''
      let paymasterUrl = ''
      if (!chain) {
        throw new Error('Not connected.')
      }

      if (chain.id === foundry.id) {
        bundlerUrl = 'http://localhost:4337'
        paymasterUrl = 'http://localhost:3000'
      }
      if (chain.id === sepolia.id && process.env['NEXT_PUBLIC_PIMLICO_KEY']) {
        const apiKey = process.env['NEXT_PUBLIC_PIMLICO_KEY']
        bundlerUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`
        paymasterUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`
      }

      const entryPoint = ENTRYPOINT_ADDRESS_V07
      const publicClient = createPublicClient({
        transport: http(),
        chain
      })

      const bundlerClient = createBundlerClient({
        transport: http(bundlerUrl),
        entryPoint,
        chain
      })
        .extend(pimlicoBundlerActions(entryPoint))
        .extend(pimlicoPaymasterActions(ENTRYPOINT_ADDRESS_V07))

      const { factory, factoryData, signerData, permissionsContext } = grantedPermissionsResponse
      if (!signerData?.userOpBuilder || !signerData.submitToAddress || !permissionsContext) {
        throw new Error('Missing value in granted permissions response')
      }
      const testDappPrivateKey = signerPrivateKey as `0x${string}`

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

      const gasPrice = await bundlerClient.getUserOperationGasPrice()
      const userOp: UserOperation<'v0.7'> = {
        sender: signerData.submitToAddress,
        factory,
        factoryData: factoryData ? (factoryData as `0x${string}`) : undefined,
        nonce,
        callData,
        callGasLimit: BigInt(2000000),
        verificationGasLimit: BigInt(2000000),
        preVerificationGas: BigInt(2000000),
        maxFeePerGas: gasPrice.fast.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
        signature: '0x'
      }
      const userOpHash = getUserOperationHash({
        userOperation: {
          ...userOp
        },
        entryPoint,
        chainId: chain.id
      })

      const dappSignatureOnUserOp = await sign({
        privateKey: testDappPrivateKey,
        hash: userOpHash
      })
      const rawSignature = signatureToHex(dappSignatureOnUserOp)
      userOp.signature = rawSignature
      const preSignaturePackedUserOp = getPackedUserOperation(userOp)
      const finalSigForValidator = await getSignatureWithContext(publicClient, {
        sender: signerData.submitToAddress,
        permissionsContext: permissionsContext as `0x${string}`,
        userOperation: preSignaturePackedUserOp,
        userOpBuilderAddress: signerData.userOpBuilder
      })

      userOp.signature = finalSigForValidator

      const packedUserOp = getPackedUserOperation(userOp)
      console.log('Final Packed UserOp to send', JSON.stringify(packedUserOp, bigIntReplacer))

      const _userOpHash = await bundlerClient.sendUserOperation({
        userOperation: userOp
      })

      const txReceipt = await bundlerClient.waitForUserOperationReceipt({
        hash: _userOpHash,
        timeout: 120000
      })

      return txReceipt.receipt.transactionHash
    } catch (e) {
      console.log(e.message)
    }
  }

  return {
    buildAndSendTransactionsWithPermissions
  }
}
