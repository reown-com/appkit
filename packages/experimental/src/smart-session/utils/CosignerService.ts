/* eslint-disable max-classes-per-file */
import { assertAddPermissionResponse } from '../helper/index.js'
import { ConstantsUtil } from './ConstantUtils.js'
import type {
  ActivatePermissionsRequest,
  AddPermissionRequest,
  AddPermissionResponse
} from './TypeUtils.js'

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
function isResponseEmptyOrInvalid(
  response: Response,
  contentType: string | null,
  contentLength: string | null
): boolean {
  return (
    // No content
    response.status === 204 ||
    // Explicit zero-length
    contentLength === '0' ||
    // No content type
    !contentType ||
    // Non-JSON response
    !contentType.includes('application/json')
  )
}

export async function sendCoSignerRequest<
  TRequest,
  TResponse = void,
  TQueryParams extends Record<string, string> = Record<string, string>
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
    // Transform request data if a transform function is provided
    const transformedData = transformRequest ? transformRequest(request) : request

    const fullUrl = new URL(url)
    Object.entries(queryParams).forEach(([key, value]) => {
      fullUrl.searchParams.append(key, value)
    })
    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(transformedData)
    }
    // Perform the fetch request
    const response = await fetch(fullUrl.toString(), fetchOptions)

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      // Try to parse error response
      const errorData = await response.text()
      throw new CoSignerApiError(response.status, errorData)
    }

    // Handle void responses explicitly
    const contentLength = response.headers.get('content-length')
    const contentType = response.headers.get('content-type')

    // If response is empty or has no content
    if (isResponseEmptyOrInvalid(response, contentType, contentLength)) {
      return undefined as TResponse
    }

    // Try to parse JSON, with fallback for empty/invalid responses
    try {
      const text = await response.text()

      return text ? JSON.parse(text) : (undefined as TResponse)
    } catch (parseError) {
      // If JSON parsing fails, return undefined
      return undefined as TResponse
    }
  } catch (error) {
    // Handle network errors or JSON parsing errors
    if (error instanceof CoSignerApiError) {
      throw error
    }

    // For other errors, throw a generic network error
    throw new CoSignerApiError(500, error instanceof Error ? error.message : 'Network error')
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
      { projectId: string; v: string }
    >({
      url,
      request: data,
      queryParams: { projectId: this.projectId, v: '2' },
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

  async revokePermissions(address: string, pci: string, signature: `0x${string}`): Promise<void> {
    const url = `${this.baseUrl}/${encodeURIComponent(address)}/revoke`
    await sendCoSignerRequest<Record<string, string>, never, { projectId: string }>({
      url,
      request: { pci, signature },
      queryParams: { projectId: this.projectId },
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
