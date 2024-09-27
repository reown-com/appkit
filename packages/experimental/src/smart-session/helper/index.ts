import {
  ParamOperator,
  type ArgumentCondition,
  type ContractCallPermission,
  type FunctionPermission,
  type KeyType,
  type Permission,
  type Signer,
  type SmartSessionGrantPermissionsRequest,
  type WalletGrantPermissionsResponse
} from '../utils/TypeUtils.js'

export const ERROR_MESSAGES = {
  UNSUPPORTED_NAMESPACE: 'Unsupported namespace',
  NO_RESPONSE_RECEIVED: 'No response received from grantPermissions',
  INVALID_REQUEST: 'Invalid request structure',
  INVALID_CHAIN_ID_TYPE: 'Invalid chainId type: must be a string',
  INVALID_CHAIN_ID_FORMAT: 'Invalid chainId: must start with "0x"',
  INVALID_EXPIRY: 'Invalid expiry: must be a positive number',
  INVALID_PERMISSIONS: 'Invalid permissions: must be a non-empty array',
  INVALID_POLICIES: 'Invalid policies: must be an array',
  INVALID_SIGNER: 'Invalid signer: must be an object',
  INVALID_SIGNER_TYPE: 'Invalid signer type: must be a string',
  INVALID_KEYS_SIGNER: 'A set of public keys is required for multiKey signers',
  UNSUPPORTED_SIGNER_TYPE: 'Unsupported signer type: must be key or keys',
  UNSUPPORTED_KEY_TYPE: 'Unsupported key type: must be secp256r1 or secp256k1',
  INVALID_KEY_TYPE: 'Invalid key: must be an object',
  INVALID_PUBLIC_KEY_TYPE: 'Invalid public key type: must be a string',
  INVALID_PUBLIC_KEY_FORMAT: 'Invalid public key: must start with "0x"',
  // GrantPermissions response errors
  INVALID_GRANT_PERMISSIONS_RESPONSE: 'Invalid grantPermissions response',
  INVALID_ADDRESS: 'Invalid address: must be a string starting with "0x"',

  unsupportedPermissionType: (type: string) =>
    `Unsupported permission type ${type}: Only 'contract-call' is supported`
}

export const CONTRACT_CALL_PERMISSION_ERROR_MESSAGES = {
  INVALID_PERMISSION_ADDRESS: 'Invalid permission address: Address should start with "0x"',
  INVALID_PERMISSION_ABI: 'Invalid permission ABI: ABI should be an array of objects',
  INVALID_FUNCTION_NAME: 'Invalid function name: Function name should be a string',
  INVALID_FUNCTION_ARGS:
    'Invalid function arguments: Args should be an array of argument conditions',
  INVALID_ARGUMENT_CONDITION:
    'Invalid argument condition: Argument condition should have a valid operator and value',
  INVALID_VALUE_LIMIT: 'Invalid value limit: Value limit should be a hex string starting with "0x"'
}

export function validateRequest(request: SmartSessionGrantPermissionsRequest) {
  if (typeof request !== 'object' || request === null) {
    throw new Error(ERROR_MESSAGES.INVALID_REQUEST)
  }

  if (typeof request.chainId !== 'string') {
    throw new Error(ERROR_MESSAGES.INVALID_CHAIN_ID_TYPE)
  }

  if (!request.chainId.startsWith('0x')) {
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
  if (!['key', 'keys'].includes(request.signer.type)) {
    throw new Error(ERROR_MESSAGES.UNSUPPORTED_SIGNER_TYPE)
  }
  validateSigner(request.signer)
  validatePermissions(request.permissions)
}

export function validateSigner(signer: Signer) {
  switch (signer.type) {
    case 'key':
      validateKey(signer.data)
      break
    case 'keys':
      if (!signer.data.keys?.length) {
        throw new Error(ERROR_MESSAGES.INVALID_KEYS_SIGNER)
      }
      signer.data.keys.forEach(validateKey)
      break
    default:
      throw new Error(ERROR_MESSAGES.UNSUPPORTED_SIGNER_TYPE)
  }
}

export function validateKey(key: { type: string; publicKey: string }) {
  if (typeof key !== 'object' || key === null) {
    throw new Error(ERROR_MESSAGES.INVALID_KEY_TYPE)
  }
  if (typeof key.type !== 'string' || !['secp256r1', 'secp256k1'].includes(key.type)) {
    throw new Error(ERROR_MESSAGES.UNSUPPORTED_KEY_TYPE)
  }
  if (typeof key.publicKey !== 'string') {
    throw new Error(ERROR_MESSAGES.INVALID_PUBLIC_KEY_TYPE)
  }
  if (!key.publicKey.startsWith('0x')) {
    throw new Error(ERROR_MESSAGES.INVALID_PUBLIC_KEY_FORMAT)
  }
}

// Validate each permission in the permissions array
function validatePermissions(permissions: Permission[]) {
  permissions.forEach(permission => {
    switch (permission.type) {
      case 'contract-call':
        validateContractCallPermission(permission)
        break
      default:
        throw new Error(ERROR_MESSAGES.unsupportedPermissionType(permission.type))
    }
  })
}

// Validate contract call permission fields
function validateContractCallPermission(permission: ContractCallPermission) {
  if (!permission.data.address || !permission.data.address.startsWith('0x')) {
    throw new Error(CONTRACT_CALL_PERMISSION_ERROR_MESSAGES.INVALID_PERMISSION_ADDRESS)
  }

  if (!Array.isArray(permission.data.abi) || permission.data.abi.length === 0) {
    throw new Error(CONTRACT_CALL_PERMISSION_ERROR_MESSAGES.INVALID_PERMISSION_ABI)
  }

  if (!Array.isArray(permission.data.functions) || permission.data.functions.length === 0) {
    throw new Error(CONTRACT_CALL_PERMISSION_ERROR_MESSAGES.INVALID_FUNCTION_ARGS)
  }

  permission.data.functions.forEach(validateFunctionPermission)
}

// Validate each function's permissions
function validateFunctionPermission(functionPermission: FunctionPermission) {
  if (typeof functionPermission.functionName !== 'string') {
    throw new Error(CONTRACT_CALL_PERMISSION_ERROR_MESSAGES.INVALID_FUNCTION_NAME)
  }
  if (functionPermission.args) {
    if (!Array.isArray(functionPermission.args)) {
      throw new Error(CONTRACT_CALL_PERMISSION_ERROR_MESSAGES.INVALID_FUNCTION_ARGS)
    }

    functionPermission.args.forEach(validateArgumentCondition)
  }
  if (functionPermission.valueLimit && typeof functionPermission.valueLimit !== 'string') {
    throw new Error(CONTRACT_CALL_PERMISSION_ERROR_MESSAGES.INVALID_VALUE_LIMIT)
  }
}

// Validate the argument conditions for each function permission
function validateArgumentCondition(condition: ArgumentCondition) {
  if (typeof condition !== 'object' || condition === null) {
    throw new Error(CONTRACT_CALL_PERMISSION_ERROR_MESSAGES.INVALID_ARGUMENT_CONDITION)
  }

  if (!Object.values(ParamOperator).includes(condition.operator)) {
    throw new Error(CONTRACT_CALL_PERMISSION_ERROR_MESSAGES.INVALID_ARGUMENT_CONDITION)
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
