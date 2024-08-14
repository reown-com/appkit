import axios, { AxiosError } from 'axios'
import { bigIntReplacer } from '../utils/CommonUtils'
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

async function sendCoSignerRequest<TRequest, TResponset>(args: {
  url: string
  data: TRequest
  projectId: string
  headers: Record<string, string>
  transformRequest?: (data: TRequest) => unknown
}) {
  const { url, data, projectId, headers, transformRequest } = args
  const transformedData = transformRequest ? transformRequest(data) : data
  try {
    return await axios.post<TResponset>(url, transformedData, {
      params: { projectId },
      headers
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.response) {
        throw new CoSignerApiError(axiosError.response.status, axiosError.response.data as string)
      } else {
        throw new CoSignerApiError(500, 'Network error')
      }
    }
    // Re-throw if it's not an Axios error
    throw error
  }
}
/**
 * Provides a set of functions to interact with the WalletConnect CoSigner API.
 * @param address - CAIP-10 address format
 * @param projectId - The project identifier
 */
export function useWalletConnectCosigner(address: string, projectId: string) {
  const baseUrl = 'https://rpc.walletconnect.com/v1/sessions'
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }
  if (!address) {
    throw new Error('CAIP-10 address is not set or invalid')
  }

  /**
   * Adds a new permission session for the account.
   *
   * @param permission - The permission details
   * @returns A promise that resolves to the new permission details
   * @throws {CoSignerApiError} If the API request fails
   */
  async function addPermission(permission: AddPermission): Promise<AddPermissionResponse> {
    const url = `${baseUrl}/${encodeURIComponent(address)}`

    const response = await sendCoSignerRequest<AddPermissionRequest, AddPermissionResponse>({
      url,
      data: { permission },
      projectId,
      headers: { 'Content-Type': 'application/json' }
    })

    return response.data
  }

  /**
   * Updates permissions context for a certain permission identifier.
   *
   * @param updateData - The update data including pci, signature, and context
   * @returns A promise that resolves when the update is successful
   * @throws {CoSignerApiError} If the API request fails
   */
  async function updatePermissionsContext(
    updateData: UpdatePermissionsContextRequest
  ): Promise<void> {
    const url = `${baseUrl}/${encodeURIComponent(address)}/context`

    await sendCoSignerRequest<UpdatePermissionsContextRequest, never>({
      url,
      data: updateData,
      projectId,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  /**
   * Revokes a permission from account sessions.
   *
   * @param revokeData - The revoke data including pci and signature
   * @returns A promise that resolves when the revocation is successful
   * @throws {CoSignerApiError} If the API request fails
   */
  async function revokePermission(revokeData: RevokePermissionRequest): Promise<void> {
    const url = `${baseUrl}/${encodeURIComponent(address)}/revoke`
    await sendCoSignerRequest<RevokePermissionRequest, never>({
      url,
      data: revokeData,
      projectId,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  /**
   * Sends a co-signing request for a user operation.
   *
   * @param coSignData - The co-sign data including pci and userOp
   * @returns A promise that resolves to the user operation receipt
   * @throws {CoSignerApiError} If the API request fails
   */
  async function coSignUserOperation(coSignData: CoSignRequest): Promise<CoSignResponse> {
    const url = `${baseUrl}/${encodeURIComponent(address)}/sign`

    const response = await sendCoSignerRequest<CoSignRequest, CoSignResponse>({
      url,
      data: coSignData,
      projectId,
      headers: { 'Content-Type': 'application/json' },
      transformRequest: (value: CoSignRequest) => JSON.stringify(value, bigIntReplacer)
    })

    return response.data
  }

  return {
    addPermission,
    updatePermissionsContext,
    revokePermission,
    coSignUserOperation
  }
}
