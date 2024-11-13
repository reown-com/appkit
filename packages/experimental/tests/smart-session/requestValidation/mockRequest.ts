import type { SmartSessionGrantPermissionsRequest } from '../../../exports/smart-session/index.js'

export function mockRequest() {
  return {
    chainId: '0x1' as `0x${string}`,
    expiry: Date.now() + 10000,
    signer: {
      type: 'keys',
      data: {
        keys: [{ type: 'secp256k1', publicKey: '0x123456' as `0x${string}` }]
      }
    },
    policies: []
  } as Omit<SmartSessionGrantPermissionsRequest, 'permissions'>
}
