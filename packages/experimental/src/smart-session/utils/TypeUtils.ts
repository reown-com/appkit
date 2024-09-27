// The types of keys that are supported for the following `key` and `keys` signer types.
export type KeyType = 'secp256r1' | 'secp256k1'

/*
 * A signer representing a single key.
 * "Key" types are explicitly secp256r1 (p256) or secp256k1, and the public keys are hex-encoded.
 */
export type KeySigner = {
  type: 'key'
  data: {
    type: KeyType
    publicKey: `0x${string}`
  }
}

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

export type Signer = KeySigner | MultiKeySigner

export type SmartSessionGrantPermissionsRequest = {
  chainId: `0x${string}`
  address?: `0x${string}`
  expiry: number
  signer: Signer
  permissions: {
    type: string
    data: Record<string, unknown>
  }[]
  policies: {
    type: string
    data: Record<string, unknown>
  }[]
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
  permissions: {
    type: string
    data: Record<string, unknown>
  }[]
  // Context is set to `pci`
  context: string
}
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
