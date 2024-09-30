import { ZodError } from 'zod'
import { ERROR_MESSAGES, SmartSessionGrantPermissionsRequestSchema } from '../schema/index.js'
import {
  type KeyType,
  type SmartSessionGrantPermissionsRequest,
  type WalletGrantPermissionsResponse
} from '../utils/TypeUtils.js'

export function validateRequest(request: SmartSessionGrantPermissionsRequest) {
  try {
    if (request === null || typeof request !== 'object') {
      throw new Error(ERROR_MESSAGES.INVALID_REQUEST)
    }

    // Check for undefined chainId explicitly
    if (!('chainId' in request) || request.chainId === undefined) {
      throw new Error(ERROR_MESSAGES.INVALID_CHAIN_ID_TYPE)
    }

    return SmartSessionGrantPermissionsRequestSchema.parse(request)
  } catch (e) {
    if (e instanceof ZodError) {
      const formattedErrors = e.errors
        .map(err => `Invalid ${err.path.join('.') || 'Unknown field'}: ${err.message}`)
        .join('; ')
      throw new Error(formattedErrors)
    }
    // Re-throw the error if it's not a ZodError
    throw e
  }
}

/**
 * Type guard to ensure that the value is a supported CAIP address.
 * @param value
 * @returns
 */
export function isValidSupportedCaipAddress(
  value: unknown
): value is `eip155:${string}:${string}` | `eip155:${number}:${string}` {
  return (
    Boolean(value) &&
    typeof value === 'string' &&
    value.startsWith('eip155:') &&
    value.split(':').length === 3
  )
}

/**
 * Extracts the address component from a supported CAIP address.
 * Returns `null` if the address is invalid or unsupported.
 * @param caipAddress The CAIP-10 address (e.g., "eip155:1:0x...")
 * @returns The extracted address or `null`
 */
export function extractAddress(caipAddress: unknown) {
  if (!isValidSupportedCaipAddress(caipAddress)) {
    throw new Error(ERROR_MESSAGES.UNSUPPORTED_NAMESPACE)
  }
  const [, , address] = caipAddress.split(':')

  return address?.startsWith('0x') ? (address as `0x${string}`) : undefined
}

/**
 * Type guard to ensure that the response is of type WalletGrantPermissionsResponse.
 * Throws an error if the response does not conform to the expected structure.
 */
export function assertWalletGrantPermissionsResponse(
  response: unknown
): WalletGrantPermissionsResponse {
  if (!response) {
    throw new Error(ERROR_MESSAGES.NO_RESPONSE_RECEIVED)
  }
  if (
    typeof response === 'object' &&
    response !== null &&
    'permissions' in response &&
    'context' in response &&
    'expiry' in response &&
    'signer' in response &&
    'chainId' in response
  ) {
    return response as WalletGrantPermissionsResponse
  }
  throw new Error(ERROR_MESSAGES.INVALID_GRANT_PERMISSIONS_RESPONSE)
}

/**
 * Updates the request signer with the new cosigner key.
 * If the current signer is of type 'key', it combines it with the new cosigner key
 * to form a 'keys' type object. If the current signer is already of type 'keys',
 * the new cosigner key is prepended to the existing keys.
 *
 * @param request SmartSessionGrantPermissionsRequest
 * @param cosignerKey The new cosigner key to be added to the request signer
 */
export function updateRequestSigner(
  request: SmartSessionGrantPermissionsRequest,
  cosignerKey: { type: KeyType; publicKey: `0x${string}` }
) {
  switch (request.signer.type) {
    case 'key': {
      // If the existing signer is of type 'key', update the signer to type 'keys'
      request.signer = {
        type: 'keys',
        data: { keys: [cosignerKey, request.signer.data] }
      }
      break
    }

    case 'keys': {
      // If the existing signer is of type 'keys', prepend the new cosigner key
      if (Array.isArray(request.signer.data?.keys)) {
        request.signer.data.keys.unshift(cosignerKey)
      }
      break
    }

    default:
      throw new Error(ERROR_MESSAGES.UNSUPPORTED_SIGNER_TYPE)
  }
}
