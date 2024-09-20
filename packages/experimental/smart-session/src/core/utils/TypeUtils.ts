export interface SmartSessionClientMethods {
  grantPermissions(
    request: SmartSessionGrantPermissionsRequest
  ): Promise<WalletGrantPermissionsResponse>
}

export type SmartSessionGrantPermissionsRequest = {
  chainId: `0x${string}`
  address?: `0x${string}`
  expiry: number
  signer: {
    type: string
    data: Record<string, any>
  }
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
