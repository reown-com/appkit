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

export type ErrorResponse = {
  message: string
  error: string
}

export type PrepareCallsParams = {
  from: `0x${string}`
  chainId: `0x${string}`
  calls: {
    to: `0x${string}`
    data: `0x${string}`
    value: `0x${string}`
  }[]
  capabilities: Record<string, unknown>
}

export type PrepareCallsReturnValue = {
  preparedCalls: {
    type: string
    data: unknown
    chainId: `0x${string}`
  }
  signatureRequest: {
    hash: `0x${string}`
  }
  context: string
}

export type SendPreparedCallsParams = {
  preparedCalls: {
    type: string
    data: unknown
    chainId: `0x${string}`
  }
  signature: `0x${string}`
  context: string
}

export type SendPreparedCallsReturnValue = `0x${string}`

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
  TResponse extends object | string,
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

    // Check for error inside response data in case of custom error shape
    if (typeof response.data === 'object' && 'error' in response.data) {
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

export async function prepareCalls(args: PrepareCallsParams): Promise<PrepareCallsReturnValue[]> {
  const response = await sendUserOpBuilderRequest<PrepareCallsParams[], PrepareCallsReturnValue[]>({
    url: `${USEROP_BUILDER_SERVICE_BASE_URL}/build`,
    data: [args],
    headers: {
      'Content-Type': 'application/json'
    },
    transformRequest: data => JSON.stringify(data, bigIntReplacer)
  })

  return response
}

export async function sendPreparedCalls(
  args: SendPreparedCallsParams
): Promise<SendPreparedCallsReturnValue> {
  const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }
  const response = await sendUserOpBuilderRequest<
    SendPreparedCallsParams[],
    SendPreparedCallsReturnValue
  >({
    url: `${USEROP_BUILDER_SERVICE_BASE_URL}/sendUserOp?projectId=${projectId}`,
    data: [args],
    headers: {
      'Content-Type': 'application/json'
    },
    transformRequest: data => JSON.stringify(data, bigIntReplacer)
  })

  return response
}
