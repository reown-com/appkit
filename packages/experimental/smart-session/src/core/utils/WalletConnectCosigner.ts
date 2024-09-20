/* eslint-disable max-classes-per-file */
import axios, { AxiosError } from 'axios'
import { ConstantsUtil } from './ConstantUtils'
import type {
  AddPermission,
  AddPermissionRequest,
  AddPermissionResponse,
  UpdatePermissionsContextRequest
} from './TypeUtils'

// -- Custom Error Class --------------------------------------------------- //
export class CoSignerApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'CoSignerApiError'
  }
}

// -- Helper Function for API Requests ------------------------------------- //
export async function sendCoSignerRequest<
  TRequest,
  TResponse,
  TQueryParams extends Record<string, string> = Record<string, never>
>({
  url,
  data,
  queryParams = {} as TQueryParams,
  headers,
  transformRequest
}: {
  url: string
  data: TRequest
  queryParams?: TQueryParams
  headers: Record<string, string>
  transformRequest?: (data: TRequest) => unknown
}): Promise<TResponse> {
  try {
    const transformedData = transformRequest ? transformRequest(data) : data
    const response = await axios.post<TResponse>(url, transformedData, {
      params: queryParams,
      headers
    })
    return response.data
  } catch (error) {
    handleAxiosError(error)
  }
}

// -- Helper for Axios Error Handling -------------------------------------- //
function handleAxiosError(error: unknown): never {
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
  throw error
}

// -- WalletConnectCosigner Class ------------------------------------------ //
export class WalletConnectCosigner {
  private baseUrl: string
  private projectId: string

  constructor(projectId: string) {
    this.baseUrl = ConstantsUtil.WC_COSIGNER_BASE_URL
    if (!projectId) {
      throw new Error('Project ID must be provided')
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
}
