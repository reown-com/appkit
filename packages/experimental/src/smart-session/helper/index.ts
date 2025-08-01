import { ZodError } from 'zod'

import { type Address } from '@reown/appkit-common'

import { ERROR_MESSAGES, SmartSessionGrantPermissionsRequestSchema } from '../schema/index.js'
import {
  type AddPermissionResponse,
  type KeyType,
  type SmartSessionGrantPermissionsRequest,
  type SubscriptionInterval,
  type WalletGrantPermissionsResponse
} from '../utils/TypeUtils.js'

export function validateRequest(request: SmartSessionGrantPermissionsRequest) {
  try {
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
 * Extracts the chain and address component from a supported CAIP address.
 * Returns `null` if the address is invalid or unsupported.
 * @param caipAddress The CAIP-10 address (e.g., "eip155:1:0x...")
 * @returns The extracted address or `null`
 */
export function extractChainAndAddress(caipAddress: unknown) {
  if (!isValidSupportedCaipAddress(caipAddress)) {
    throw new Error(ERROR_MESSAGES.UNSUPPORTED_NAMESPACE)
  }
  const [, chain, address] = caipAddress.split(':')

  return chain && address?.startsWith('0x') ? { chain, address: address as Address } : undefined
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
 * If the current signer is of type 'keys', the new cosigner key is prepended to the existing keys.
 * @param request SmartSessionGrantPermissionsRequest
 * @param cosignerKey The new cosigner key to be added to the request signer
 */
export function updateRequestSigner(
  request: SmartSessionGrantPermissionsRequest,
  cosignerKey: { type: KeyType; publicKey: `0x${string}` }
) {
  switch (request.signer.type) {
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

/**
 * Asserts that the given response is of type AddPermissionResponse.
 *
 * This function performs runtime checks to ensure that the response
 * matches the expected structure. It verifies that:
 * - The response is an object and not null.
 * - The `pci` property is a string.
 * - The `key` property is an object containing:
 *   - `type`: A valid KeyType ('secp256k1' or 'secp256r1').
 *   - `publicKey`: A string that starts with '0x'.
 *
 * If any of these checks fail, an error is thrown with a descriptive message.
 *
 * @param response - The response object to validate.
 * @throws {Error} If the response does not match the expected structure.
 */
export function assertAddPermissionResponse(
  response: unknown
): asserts response is AddPermissionResponse {
  if (typeof response !== 'object' || response === null) {
    throw new Error('Response is not an object')
  }

  const { pci, key } = response as Record<string, unknown>

  if (typeof pci !== 'string') {
    throw new Error('pci is not a string')
  }

  if (typeof key !== 'object' || key === null) {
    throw new Error('key is not an object')
  }

  const { type, publicKey } = key as Record<string, unknown>

  if ((type as string).toLowerCase() !== 'secp256k1' && type !== 'secp256r1') {
    throw new Error('Invalid key type')
  }

  if (typeof publicKey !== 'string' || !publicKey.startsWith('0x')) {
    throw new Error('Invalid public key format')
  }
}

export function getIntervalInSeconds(interval: SubscriptionInterval): number {
  const oneDayInSeconds = 24 * 60 * 60
  switch (interval) {
    case '1s':
      return 1
    case '1d':
      return oneDayInSeconds
    case '1w':
      return oneDayInSeconds * 7
    case '1m':
      return oneDayInSeconds * 30
    default:
      throw new Error('Invalid interval')
  }
}
