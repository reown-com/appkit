import type { Address, Hex } from '@reown/appkit-common'

import type { SmartSessionGrantPermissionsRequest } from '../../../exports/smart-session/index.js'

export function mockRequest() {
  return {
    chainId: '0x1' as Hex,
    expiry: Date.now() + 10000,
    signer: {
      type: 'keys',
      data: {
        keys: [{ type: 'secp256k1', publicKey: '0x123456' as Address }]
      }
    },
    policies: []
  } as Omit<SmartSessionGrantPermissionsRequest, 'permissions'>
}
