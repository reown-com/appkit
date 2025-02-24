export type CapabilityName = 'atomicBatch' | 'paymasterService' | 'sessionKey' | 'assetDiscovery'
interface WalletServiceCapability {
  wallet_getAssets?: string
}
export type Capabilities = {
  [K in CapabilityName]?: {
    supported: boolean
  }
} & {
  walletService?: WalletServiceCapability
}
export type GetCapabilitiesResult = Record<string, Capabilities>
export type GetCallsStatusParams = `0x${string}`

export type SendCallsParams = {
  version: string
  chainId: `0x${string}`
  from: `0x${string}`
  calls: {
    to: `0x${string}`
    data?: `0x${string}` | undefined
    value?: `0x${string}` | undefined
  }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  capabilities?: Record<string, any> | undefined
}
