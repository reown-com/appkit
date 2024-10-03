type BaseCapability = {
  supported: boolean
}

export type AtomicBatchCapability = BaseCapability

export type PaymasterServiceCapability = BaseCapability & {
  url: string
  context: Record<string, unknown> | undefined
}

export type PermissionsCapability = BaseCapability & {
  signerTypes: string[]
  permissionTypes: string[]
  policyTypes: string[]
}

export type ChainCapabilities = {
  atomicBatch?: AtomicBatchCapability
  paymasterService?: PaymasterServiceCapability
  permissions?: PermissionsCapability
}

export type WalletCapabilities = Record<`0x${string}`, ChainCapabilities>
