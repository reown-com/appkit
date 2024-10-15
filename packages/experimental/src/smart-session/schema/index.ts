import { z } from 'zod'
import { Operation, ParamOperator } from '../utils/TypeUtils.js'

// Define custom error messages
export const ERROR_MESSAGES = {
  UNSUPPORTED_NAMESPACE: 'Unsupported namespace',
  NO_RESPONSE_RECEIVED: 'No response received from grantPermissions',
  INVALID_REQUEST: 'Invalid request structure',
  // GrantPermissionsRequest.chainId field
  INVALID_CHAIN_ID_FORMAT: 'Invalid chainId: must start with "0x"',
  INVALID_CHAIN_ID_DATA: 'Invalid chainId format: Must be a hexadecimal string starting with "0x"',
  // GrantPermissionsRequest.address field
  INVALID_ADDRESS: 'Invalid address: must be a string starting with "0x"',
  // GrantPermissionsRequest.expiry field
  INVALID_EXPIRY: 'Invalid expiry: Expiry must be a future timestamp',

  // GrantPermissionsRequest.signer field -  SignerSchema
  INVALID_KEYS_SIGNER: 'A set of public keys is required for multiKey signers',
  UNSUPPORTED_SIGNER_TYPE: 'Unsupported signer type',
  UNSUPPORTED_KEY_TYPE: 'Unsupported key type: must be secp256r1 or secp256k1',
  INVALID_PUBLIC_KEY_FORMAT: 'Invalid public key: must start with "0x"',
  //PermissionSchema
  INVALID_PERMISSIONS: 'Invalid permissions: must be a non-empty array',
  INVALID_PERMISSIONS_TYPE: 'Invalid permissions: Expected array, received object',

  INVALID_ALLOWANCE_FORMAT: 'Invalid allowance: must be a hexadecimal string starting with "0x"',
  INVALID_START: 'Invalid start time: must be a positive integer and in the future',
  INVALID_PERIOD: 'Invalid period: must be a positive integer',
  //PolicySchema
  INVALID_POLICIES: 'Invalid policies: must be a non-empty array',
  INVALID_POLICIES_TYPE: 'Invalid policies: Expected array, received object',

  INVALID_GRANT_PERMISSIONS_RESPONSE: 'Invalid grantPermissions response'
}

// ChainId Schema
const ChainIdSchema = z
  .string()
  .refine(val => val.startsWith('0x'), {
    message: ERROR_MESSAGES.INVALID_CHAIN_ID_FORMAT
  })
  .refine(val => /^0x[0-9a-fA-F]+$/u.test(val), {
    message: ERROR_MESSAGES.INVALID_CHAIN_ID_DATA
  })

// Address Schema
const AddressSchema = z
  .string({
    invalid_type_error: ERROR_MESSAGES.INVALID_ADDRESS
  })
  .startsWith('0x', { message: ERROR_MESSAGES.INVALID_ADDRESS })
  .optional()

// Expiry Schema
const ExpirySchema = z
  .number()
  .positive({ message: ERROR_MESSAGES.INVALID_EXPIRY })
  .refine(value => value > Math.floor(Date.now() / 1000), {
    message: ERROR_MESSAGES.INVALID_EXPIRY
  })

// Key Schema
const KeySchema = z.object({
  type: z.enum(['secp256r1', 'secp256k1'], {
    errorMap: () => ({ message: ERROR_MESSAGES.UNSUPPORTED_KEY_TYPE })
  }),
  publicKey: z.string().refine(val => val.startsWith('0x'), {
    message: ERROR_MESSAGES.INVALID_PUBLIC_KEY_FORMAT
  })
})

// Signer Schema
const SignerSchema = z.object({
  type: z.literal('keys'),
  data: z.object({
    keys: z.array(KeySchema).min(1, { message: ERROR_MESSAGES.INVALID_KEYS_SIGNER })
  })
})

// Argument Condition Schema
const ArgumentConditionSchema = z.object({
  operator: z.nativeEnum(ParamOperator, { errorMap: () => ({ message: 'Invalid operator type' }) }),
  value: z.string().startsWith('0x', { message: ERROR_MESSAGES.INVALID_ADDRESS })
})

// Function Permission Schema
const FunctionPermissionSchema = z.object({
  functionName: z.string(),
  args: z.array(ArgumentConditionSchema).optional(),
  valueLimit: z.string().startsWith('0x', { message: ERROR_MESSAGES.INVALID_ADDRESS }).optional(),
  operation: z.nativeEnum(Operation).optional()
})

// Contract Call Permission Schema
const ContractCallPermissionSchema = z.object({
  type: z.literal('contract-call'),
  data: z.object({
    address: z.string().startsWith('0x', { message: ERROR_MESSAGES.INVALID_ADDRESS }),
    abi: z.array(z.record(z.unknown())),
    functions: z.array(FunctionPermissionSchema)
  })
})

// Native Token Recurring Allowance Permission Schema
const NativeTokenRecurringAllowancePermissionSchema = z.object({
  type: z.literal('native-token-recurring-allowance'),
  data: z.object({
    allowance: z.string().startsWith('0x', { message: ERROR_MESSAGES.INVALID_ALLOWANCE_FORMAT }),
    start: z
      .number()
      .positive({ message: ERROR_MESSAGES.INVALID_START })
      .refine(value => value > Math.floor(Date.now() / 1000), {
        message: ERROR_MESSAGES.INVALID_START
      }),
    period: z.number().positive({ message: ERROR_MESSAGES.INVALID_PERIOD })
  })
})

// ERC20 Recurring Allowance Permission Schema
const ERC20RecurringAllowancePermissionSchema = z.object({
  type: z.literal('erc20-recurring-allowance'),
  data: z.object({
    token: z.string().startsWith('0x', { message: ERROR_MESSAGES.INVALID_ADDRESS }),
    allowance: z.string().startsWith('0x', { message: ERROR_MESSAGES.INVALID_ALLOWANCE_FORMAT }),
    start: z
      .number()
      .positive({ message: ERROR_MESSAGES.INVALID_START })
      .refine(value => value > Math.floor(Date.now() / 1000), {
        message: ERROR_MESSAGES.INVALID_START
      }),
    period: z.number().positive({ message: ERROR_MESSAGES.INVALID_PERIOD })
  })
})

// Update Permission Schema to support new types
const PermissionSchema = z.union([
  ContractCallPermissionSchema,
  NativeTokenRecurringAllowancePermissionSchema,
  ERC20RecurringAllowancePermissionSchema
])
// Policies Schema
const PolicySchema = z.object({
  type: z.string(),
  data: z.record(z.unknown())
})

// Smart Session Grant Permissions Request Schema
export const SmartSessionGrantPermissionsRequestSchema = z
  .object({
    chainId: ChainIdSchema,
    address: AddressSchema,
    expiry: ExpirySchema,
    signer: SignerSchema,
    permissions: z
      .array(PermissionSchema)
      .nonempty({ message: ERROR_MESSAGES.INVALID_PERMISSIONS }),
    policies: z.array(PolicySchema)
  })
  // This ensures no extra properties are allowed
  .strict()
