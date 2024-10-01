/* eslint-disable max-classes-per-file */
import axios, { AxiosError } from 'axios'
import { ConstantsUtil } from './ConstantUtils.js'
import type {
  ActivatePermissionsRequest,
  AddPermissionRequest,
  AddPermissionResponse
} from './TypeUtils.js'
import { assertAddPermissionResponse } from '../helper/index.js'

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
  TQueryParams extends Record<string, string>
>({
  url,
  request,
  queryParams = {} as TQueryParams,
  headers,
  transformRequest
}: {
  url: string
  request: TRequest
  queryParams?: TQueryParams
  headers: Record<string, string>
  transformRequest?: (data: TRequest) => unknown
}): Promise<TResponse> {
  try {
    const transformedData = transformRequest ? transformRequest(request) : request
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
    throw error
  }
}

// -- CosignerService Class ------------------------------------------ //
export class CosignerService {
  private baseUrl: string
  private projectId: string

  constructor(projectId: string) {
    this.baseUrl = ConstantsUtil.COSIGNER_BASE_URL
    if (!projectId) {
      throw new Error('Project ID must be provided')
    }
    this.projectId = projectId
  }

  async addPermission(address: string, data: AddPermissionRequest): Promise<AddPermissionResponse> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}`

    const response = await sendCoSignerRequest<
      AddPermissionRequest,
      AddPermissionResponse,
      { projectId: string }
    >({
      url,
      request: data,
      queryParams: { projectId: this.projectId },
      headers: { 'Content-Type': 'application/json' }
    })
    assertAddPermissionResponse(response)

    return response
  }

  async activatePermissions(
    address: string,
    updateData: ActivatePermissionsRequest
  ): Promise<void> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}/activate`
    await sendCoSignerRequest<ActivatePermissionsRequest, never, { projectId: string }>({
      url,
      request: updateData,
      queryParams: { projectId: this.projectId },
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
