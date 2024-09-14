import axios, { AxiosError } from 'axios'
import { bigIntReplacer } from '../utils/CommonUtils'
import type { Address, Hex } from 'viem'
import { USEROP_BUILDER_SERVICE_BASE_URL } from './ConstantsUtil'

export type Call = { to: Address; value: bigint; data: Hex }

export type UserOperationWithBigIntAsHex = {
  sender: Address
  nonce: Hex
  factory: Address | undefined
  factoryData: Hex | undefined
  callData: Hex
  callGasLimit: Hex
  verificationGasLimit: Hex
  preVerificationGas: Hex
  maxFeePerGas: Hex
  maxPriorityFeePerGas: Hex
  paymaster: Address | undefined
  paymasterVerificationGasLimit: Hex | undefined
  paymasterPostOpGasLimit: Hex | undefined
  paymasterData: Hex | undefined
  signature: Hex
  initCode?: never
  paymasterAndData?: never
}

export type BuildUserOpRequestParams = {
  chainId: number
  account: Address
  calls: Call[]
  capabilities: {
    paymasterService?: { url: string }
    permissions?: { context: Hex }
  }
}
export type BuildUserOpResponseReturn = {
  userOp: UserOperationWithBigIntAsHex
  hash: Hex
}

export type ErrorResponse = {
  message: string
  error: string
}

export type SendUserOpRequestParams = {
  chainId: number
  userOp: UserOperationWithBigIntAsHex
  pci?: string
  permissionsContext?: Hex
}
export type SendUserOpResponseReturn = {
  userOpId: Hex
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

export async function buildUserOp(
  args: BuildUserOpRequestParams
): Promise<BuildUserOpResponseReturn> {
  const response = await sendUserOpBuilderRequest<
    BuildUserOpRequestParams,
    BuildUserOpResponseReturn
  >({
    url: `${USEROP_BUILDER_SERVICE_BASE_URL}/build`,
    data: args,
    headers: {
      'Content-Type': 'application/json'
    },
    transformRequest: data => JSON.stringify(data, bigIntReplacer)
  })

  return response
}

export async function sendUserOp(args: SendUserOpRequestParams) {
  const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }
  const response = await sendUserOpBuilderRequest<
    SendUserOpRequestParams,
    SendUserOpResponseReturn
  >({
    url: `${USEROP_BUILDER_SERVICE_BASE_URL}/sendUserOp?projectId=${projectId}`,
    data: args,
    headers: {
      'Content-Type': 'application/json'
    },
    transformRequest: data => JSON.stringify(data, bigIntReplacer)
  })

  return response
}
