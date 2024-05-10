export type CapabilityName = 'atomicBatch' | 'paymasterService' | 'sessionKey'
export type Capabilities = {
  [K in CapabilityName]?: {
    supported: boolean
  }
}
export type GetCapabilitiesResult = Record<string, Capabilities>
export type GetCallsStatusParams = `0x${string}`

