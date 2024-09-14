/* eslint-disable max-classes-per-file */
import axios, { AxiosError } from 'axios'
import { bigIntReplacer } from './CommonUtils'
import type { UserOperationWithBigIntAsHex } from './UserOpBuilderServiceUtils'
import { WC_COSIGNER_BASE_URL } from './ConstantsUtil'

// Define types for the request and response
type AddPermission = {
  permissionType: string
  data: string
  required: boolean
  onChainValidated: boolean
}

type AddPermissionRequest = {
  permission: AddPermission
}

export type AddPermissionResponse = {
  pci: string
  key: string
}

type Signer = {
  type: string
  data: {
    ids: string[]
  }
}

type SignerData = {
  userOpBuilder: string
}

type PermissionsContext = {
  signer: Signer
  expiry: number
  signerData: SignerData
  factory?: string
  factoryData?: string
  permissionsContext: string
}

type UpdatePermissionsContextRequest = {
  pci: string
  signature?: string
  context: PermissionsContext
}

type RevokePermissionRequest = {
  pci: string
  signature: string
}

type CoSignRequest = {
  pci: string
  userOp: UserOperationWithBigIntAsHex
}

type CoSignResponse = {
  receipt: string
}

// Define a custom error type
export class CoSignerApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'CoSignerApiError'
  }
}

// Function to send requests to the CoSigner API
async function sendCoSignerRequest<
  TRequest,
  TResponse,
  TQueryParams extends Record<string, string> = Record<string, never>
>(args: {
  url: string
  data: TRequest
  queryParams?: TQueryParams
  headers: Record<string, string>
  transformRequest?: (data: TRequest) => unknown
}): Promise<TResponse> {
  const { url, data, queryParams = {}, headers, transformRequest } = args
  const transformedData = transformRequest ? transformRequest(data) : data

  try {
    const response = await axios.post<TResponse>(url, transformedData, {
      params: queryParams,
      headers
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.response) {
        throw new CoSignerApiError(
          axiosError.response.status,
          JSON.stringify(axiosError.response.data)
        )
      } else {
        throw new CoSignerApiError(500, 'Network error')
      }
    }
    // Re-throw if it's not an Axios error
    throw error
  }
}

// Class to interact with the WalletConnect CoSigner API
export class WalletConnectCosigner {
  private baseUrl: string
  private projectId: string

  constructor() {
    this.baseUrl = WC_COSIGNER_BASE_URL
    const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
    }
    this.projectId = projectId
  }

  async addPermission(address: string, permission: AddPermission): Promise<AddPermissionResponse> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}`

    return await sendCoSignerRequest<
      AddPermissionRequest,
      AddPermissionResponse,
      { projectId: string }
    >({
      url,
      data: { permission },
      queryParams: { projectId: this.projectId },
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async updatePermissionsContext(
    address: string,
    updateData: UpdatePermissionsContextRequest
  ): Promise<void> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}/context`
    await sendCoSignerRequest<UpdatePermissionsContextRequest, never, { projectId: string }>({
      url,
      data: updateData,
      queryParams: { projectId: this.projectId },
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async revokePermission(address: string, revokeData: RevokePermissionRequest): Promise<void> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}/revoke`
    await sendCoSignerRequest<RevokePermissionRequest, never, { projectId: string }>({
      url,
      data: revokeData,
      queryParams: { projectId: this.projectId },
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async coSignUserOperation(address: string, coSignData: CoSignRequest): Promise<CoSignResponse> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}/sign`

    return await sendCoSignerRequest<CoSignRequest, CoSignResponse, { projectId: string }>({
      url,
      data: coSignData,
      queryParams: { projectId: this.projectId },
      headers: { 'Content-Type': 'application/json' },
      transformRequest: (value: CoSignRequest) => JSON.stringify(value, bigIntReplacer)
    })
  }
}
