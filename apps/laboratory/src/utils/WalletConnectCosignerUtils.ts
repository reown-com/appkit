/* eslint-disable max-classes-per-file */
import axios, { AxiosError } from 'axios'
import { bigIntReplacer } from './CommonUtils'
import type { UserOperation } from 'permissionless'

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
  userOp: UserOperation<'v0.7'>
}

type CoSignResponse = {
  userOperationTxHash: string
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
async function sendCoSignerRequest<TRequest, TResponse>(args: {
  url: string
  data: TRequest
  projectId: string
  headers: Record<string, string>
  transformRequest?: (data: TRequest) => unknown
}) {
  const { url, data, projectId, headers, transformRequest } = args
  const transformedData = transformRequest ? transformRequest(data) : data

  try {
    return await axios.post<TResponse>(url, transformedData, {
      params: { projectId },
      headers
    })
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
    this.baseUrl = 'https://rpc.walletconnect.com/v1/sessions'
    const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
    }
    this.projectId = projectId
  }

  async addPermission(address: string, permission: AddPermission): Promise<AddPermissionResponse> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}`

    const response = await sendCoSignerRequest<AddPermissionRequest, AddPermissionResponse>({
      url,
      data: { permission },
      projectId: this.projectId,
      headers: { 'Content-Type': 'application/json' }
    })

    return response.data
  }

  async updatePermissionsContext(
    address: string,
    updateData: UpdatePermissionsContextRequest
  ): Promise<void> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}/context`
    await sendCoSignerRequest<UpdatePermissionsContextRequest, never>({
      url,
      data: updateData,
      projectId: this.projectId,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async revokePermission(address: string, revokeData: RevokePermissionRequest): Promise<void> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}/revoke`
    await sendCoSignerRequest<RevokePermissionRequest, never>({
      url,
      data: revokeData,
      projectId: this.projectId,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async coSignUserOperation(address: string, coSignData: CoSignRequest): Promise<CoSignResponse> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}/sign`
    if (!this.projectId) {
      throw new Error('Project ID is not defined')
    }
    const response = await sendCoSignerRequest<CoSignRequest, CoSignResponse>({
      url,
      data: coSignData,
      projectId: this.projectId,
      headers: { 'Content-Type': 'application/json' },
      transformRequest: (value: CoSignRequest) => JSON.stringify(value, bigIntReplacer)
    })

    return response.data
  }
}
