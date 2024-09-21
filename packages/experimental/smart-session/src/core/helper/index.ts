import type { Signer, SmartSessionGrantPermissionsRequest } from '../utils/TypeUtils.js'

export const ERROR_MESSAGES = {
  UNSUPPORTED_NAMESPACE: 'Unsupported namespace',
  NO_RESPONSE_RECEIVED: 'No response received from grantPermissions',
  INVALID_REQUEST: 'Invalid request structure',
  INVALID_CHAIN_ID_TYPE: 'Invalid chainId type: must be a string',
  INVALID_EXPIRY: 'Invalid expiry: must be a positive number',
  INVALID_PERMISSIONS: 'Invalid permissions: must be a non-empty array',
  INVALID_POLICIES: 'Invalid policies: must be an array',
  INVALID_SIGNER: 'Invalid signer: must be an object',
  INVALID_SIGNER_TYPE: 'Invalid signer type: must be a string',
  INVALID_KEY_SIGNER: 'A public key is required for key signers',
  INVALID_KEYS_SIGNER: 'A set of public keys is required for multisig signers',
  INVALID_ACCOUNT_SIGNER: 'An address is required for account signers',
  UNSUPPORTED_SIGNER_TYPE: 'Unsupported signer type',
  INVALID_CHAIN_ID_FORMAT: 'Invalid chainId: must start with "0x"'
}

export function validateRequest(request: SmartSessionGrantPermissionsRequest) {
  if (typeof request !== 'object' || request === null) {
    throw new Error(ERROR_MESSAGES.INVALID_REQUEST)
  }
  if (typeof request.chainId !== 'string') {
    throw new Error(ERROR_MESSAGES.INVALID_CHAIN_ID_TYPE)
  }
  if (typeof request.chainId !== 'string' || !request.chainId.startsWith('0x')) {
    throw new Error(ERROR_MESSAGES.INVALID_CHAIN_ID_FORMAT)
  }

  if (typeof request.expiry !== 'number' || request.expiry <= 0) {
    throw new Error(ERROR_MESSAGES.INVALID_EXPIRY)
  }

  if (!Array.isArray(request.permissions) || request.permissions.length === 0) {
    throw new Error(ERROR_MESSAGES.INVALID_PERMISSIONS)
  }

  if (!Array.isArray(request.policies)) {
    throw new Error(ERROR_MESSAGES.INVALID_POLICIES)
  }

  if (typeof request.signer !== 'object' || request.signer === null) {
    throw new Error(ERROR_MESSAGES.INVALID_SIGNER)
  }

  if (typeof request.signer.type !== 'string') {
    throw new Error(ERROR_MESSAGES.INVALID_SIGNER_TYPE)
  }
  if (!['wallet', 'key', 'keys', 'account'].includes(request.signer.type)) {
    throw new Error(ERROR_MESSAGES.UNSUPPORTED_SIGNER_TYPE)
  }
}

export function validateSigner(signer: Signer) {
  switch (signer.type) {
    case 'wallet':
      // No additional validation needed for wallet signers
      break
    case 'key':
      if (!signer.data.publicKey) {
        throw new Error(ERROR_MESSAGES.INVALID_KEY_SIGNER)
      }
      break
    case 'keys':
      if (!signer.data.keys || signer.data.keys.length === 0) {
        throw new Error(ERROR_MESSAGES.INVALID_KEYS_SIGNER)
      }
      break
    case 'account':
      if (!signer.data.address) {
        throw new Error(ERROR_MESSAGES.INVALID_ACCOUNT_SIGNER)
      }
      break
    default:
      throw new Error(ERROR_MESSAGES.UNSUPPORTED_SIGNER_TYPE)
  }
}
