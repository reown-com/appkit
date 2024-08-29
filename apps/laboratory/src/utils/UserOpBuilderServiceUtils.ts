import axios, { AxiosError } from 'axios'
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

// Define a custom error type
export class UserOpBuilderApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'UserOpBuilderApiError'
  }
}

// Function to send requests to the CoSigner API
async function sendUserOpBuilderRequest<
  TRequest,
  TResponse extends object,
  TQueryParams extends Record<string, string> = Record<string, never>
>(args: {
  url: string
  headers: Record<string, string>
  data: TRequest
  queryParams?: TQueryParams
  transformRequest?: (data: TRequest) => unknown
}): Promise<TResponse> {
  const { url, data, queryParams, headers, transformRequest } = args
  const transformedData = transformRequest ? transformRequest(data) : data

  try {
    const response = await axios.post<TResponse | ErrorResponse>(url, transformedData, {
      params: queryParams,
      headers
    })

    if ('error' in response.data) {
      throw new Error(response.data.error)
    }

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.response) {
        throw new UserOpBuilderApiError(
          axiosError.response.status,
          JSON.stringify(axiosError.response.data)
        )
      } else {
        throw new UserOpBuilderApiError(500, 'Network error')
      }
    }
    // Re-throw if it's not an Axios error
    throw error
  }
}

const BASE_USEROP_BUILDER_SERVICE_URL = 'https://react-wallet.walletconnect.com/api'

export async function buildUserOp(args: BuildUserOpRequestArguments): Promise<FillUserOpResponse> {
  const response = await sendUserOpBuilderRequest<BuildUserOpRequestArguments, FillUserOpResponse>({
    url: `${BASE_USEROP_BUILDER_SERVICE_URL}/build`,
    data: args,
    headers: {
      'Content-Type': 'application/json'
    },
    transformRequest: data => JSON.stringify(data, bigIntReplacer)
  })

  return response
}

export async function sendUserOp(args: SendUserOpWithSignatureParams) {
  const response = await sendUserOpBuilderRequest<
    SendUserOpWithSignatureParams,
    SendUserOpWithSignatureResponse
  >({
    url: `${BASE_USEROP_BUILDER_SERVICE_URL}/sendUserOp`,
    data: args,
    headers: {
      'Content-Type': 'application/json'
    },
    transformRequest: data => JSON.stringify(data, bigIntReplacer)
  })

  return response
}
