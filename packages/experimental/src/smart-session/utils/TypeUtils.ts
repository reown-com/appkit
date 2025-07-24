// The types of keys that are supported for the following `key` and `keys` signer types.
export type KeyType = 'secp256r1' | 'secp256k1'

export type SubscriptionInterval = '1s' | '1d' | '1w' | '1m'
type SubscriptionAsset = 'native'

export type CreateSubscriptionRequest = {
  chainId: `0x${string}`
  signerPublicKey: `0x${string}`
  interval: SubscriptionInterval
  asset: SubscriptionAsset
  amount: `0x${string}`
  expiry: number
}

export type CreateSubscriptionResponse = SmartSessionGrantPermissionsResponse

/*
 * A signer representing a multisig signer.
 * Each element of `publicKeys` are all explicitly the same `KeyType`, and the public keys are hex-encoded.
 */
export type MultiKeySigner = {
  type: 'keys'
  data: {
    keys: {
      type: KeyType
      publicKey: `0x${string}`
    }[]
  }
}

export type Signer = MultiKeySigner

export type SmartSessionGrantPermissionsRequest = {
  chainId: `0x${string}`
  address?: `0x${string}`
  expiry: number
  signer: Signer
  permissions: Permission[]
  policies: {
    type: string
    data: Record<string, unknown>
  }[]
  version?: number
}

export type WalletGrantPermissionsResponse = SmartSessionGrantPermissionsRequest & {
  context: `0x${string}`
  accountMeta?: {
    factory: `0x${string}`
    factoryData: `0x${string}`
  }
  signerMeta?: {
    // 7679 userOp building
    userOpBuilder?: `0x${string}`
    // 7710 delegation
    delegationManager?: `0x${string}`
  }
}

export type SmartSessionGrantPermissionsResponse = {
  chainId: `0x${string}`
  address: `0x${string}`
  expiry: number
  permissions: Permission[]
  // Context is set to `pci`
  context: string
}

// Enum for parameter operators
// eslint-disable-next-line no-shadow
export enum ParamOperator {
  EQUAL = 'EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN'
}

// Enum for operation types
// eslint-disable-next-line no-shadow
export enum Operation {
  Call = 'Call',
  DelegateCall = 'DelegateCall'
}

// Type for a single argument condition
export type ArgumentCondition = {
  operator: ParamOperator
  value: `0x${string}`
}

// Type for a single function permission
export type FunctionPermission = {
  // Function name
  functionName: string
  // An array of conditions, each corresponding to an argument for the function
  args?: ArgumentCondition[]
  // Maximum value that can be transferred for this specific function call
  valueLimit?: `0x${string}`
  // (optional) whether this is a call or a delegatecall. Defaults to call
  operation?: Operation
}
export type ContractCallPermission = {
  type: 'contract-call'
  data: {
    address: `0x${string}`
    abi: Record<string, unknown>[]
    functions: FunctionPermission[]
  }
}

export type NativeTokenRecurringAllowancePermission = {
  type: 'native-token-recurring-allowance'
  data: {
    allowance: `0x${string}`
    start: number
    period: number
  }
}

export type ERC20RecurringAllowancePermission = {
  type: 'erc20-recurring-allowance'
  data: {
    token: `0x${string}`
    allowance: `0x${string}`
    start: number
    period: number
  }
}
// Union type for all possible permissions
export type Permission =
  | ContractCallPermission
  | NativeTokenRecurringAllowancePermission
  | ERC20RecurringAllowancePermission

//--Cosigner Types----------------------------------------------------------------------- //
export type AddPermissionRequest = SmartSessionGrantPermissionsRequest

export type AddPermissionResponse = {
  pci: string
  key: {
    type: KeyType
    publicKey: `0x${string}`
  }
}

export type ActivatePermissionsRequest = {
  pci: string
  context: `0x${string}`
} & AddPermissionRequest

export type Policy = {
  id: string
}

export type SmartSessionStatus = 'active' | 'expired' | 'revoked'

export type SmartSession = {
  project: {
    id: string
    name: string
    url?: string
    iconUrl?: string
  }
  pci: string
  expiry: number
  createdAt: number
  permissions: Permission[]
  policies: Policy[]
  context: string
  revokedAt?: number
}
