import axios from 'axios'
import { bigIntReplacer } from '../utils/CommonUtils'
import type { Address, Hex } from 'viem'

export type Call = { to: Address; value: bigint; data: Hex }

export type BuildUserOpRequestArguments = {
  account: Address
  chainId: number
  calls: Call[]
  capabilities: {
    paymasterService?: { url: string }
    permissions?: { context: Hex }
  }
}
/**
 * UserOperation v0.7
 */
export type UserOperation = {
  sender: Address
  nonce: bigint
  factory?: Address
  factoryData?: Hex
  callData: Hex
  callGasLimit: bigint
  verificationGasLimit: bigint
  preVerificationGas: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  paymaster?: Address
  paymasterVerificationGasLimit?: bigint
  paymasterPostOpGasLimit?: bigint
  paymasterData?: Hex
  signature: Hex
  initCode?: never
  paymasterAndData?: never
}

export type FillUserOpResponse = {
  userOp: UserOperation
  hash: Hex
}

export type ErrorResponse = {
  message: string
  error: string
}

export type SendUserOpWithSignatureParams = {
  chainId: number
  userOp: UserOperation
  signature: Hex
  permissionsContext?: Hex
}
export type SendUserOpWithSignatureResponse = {
  receipt: Hex
}

export async function buildUserOp(args: BuildUserOpRequestArguments) {
  const baseUrl = 'https://react-wallet.walletconnect.com/api/build'
  const transformedArgs = JSON.parse(JSON.stringify(args, bigIntReplacer))
  const response = await axios.post<FillUserOpResponse | ErrorResponse>(baseUrl, transformedArgs)

  if ('error' in response.data) {
    throw new Error(response.data.error)
  }

  return response.data
}

export async function sendUserOp(args: SendUserOpWithSignatureParams) {
  const baseUrl = 'https://react-wallet.walletconnect.com/api/sendUserOp'
  const transformedArgs = JSON.parse(JSON.stringify(args, bigIntReplacer))
  const response = await axios.post<SendUserOpWithSignatureResponse | ErrorResponse>(
    baseUrl,
    transformedArgs
  )

  if ('error' in response.data) {
    throw new Error(response.data.error)
  }

  return response.data
}
