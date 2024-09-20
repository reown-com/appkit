// A wallet is the signer for these permissions
// `data` is not necessary for this signer type as the wallet is both the signer and grantor of these permissions
export type WalletSigner = {
  type: 'wallet'
  data: {}
}

// The types of keys that are supported for the following `key` and `keys` signer types.
export type KeyType = 'secp256r1' | 'secp256k1' | 'ed25519' | 'schnorr'

// A signer representing a single key.
// "Key" types are explicitly secp256r1 (p256) or secp256k1, and the public keys are hex-encoded.
export type KeySigner = {
  type: 'key'
  data: {
    type: KeyType
    publicKey: `0x${string}`
  }
}

// A signer representing a multisig signer.
// Each element of `publicKeys` are all explicitly the same `KeyType`, and the public keys are hex-encoded.
export type MultiKeySigner = {
  type: 'keys'
  data: {
    keys: {
      type: KeyType
      publicKey: `0x${string}`
    }[]
  }
}

// An account that can be granted with permissions as in ERC-7710.
export type AccountSigner = {
  type: 'account'
  data: {
    address: `0x${string}`
  }
}

export type Signer = WalletSigner | KeySigner | MultiKeySigner | AccountSigner

export type SmartSessionGrantPermissionsRequest = {
  chainId: `0x${string}`
  address?: `0x${string}`
  expiry: number
  signer: Signer
  permissions: {
    type: string
    data: Record<string, any>
  }[]
  policies: {
    type: string
    data: Record<string, any>
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
  permissions: {
    type: string
    data: Record<string, any>
  }[]
  context: string // context is set to `pci`
}
//--Cosigner Types----------------------------------------------------------------------- //
export type AddPermissionRequest = SmartSessionGrantPermissionsRequest

export type AddPermissionResponse = {
  pci: string
  key: `0x${string}`
}

export type ActivatePermissionsRequest = {
  pci: string
  context: `0x${string}`
} & AddPermissionRequest
