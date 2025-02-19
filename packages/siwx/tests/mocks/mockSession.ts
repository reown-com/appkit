import type { CaipNetworkId } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-controllers'

type MockSessionReplaces = {
  [K in keyof SIWXSession]?: Partial<SIWXSession[K]>
}

export function mockSession(
  replaces: MockSessionReplaces = { data: {}, message: '', signature: '' }
): SIWXSession {
  return {
    data: {
      domain: 'example.com',
      accountAddress: '0xb3F068DCc2f92ED42E0417d4f2C2191f743fBfdA',
      statement: 'This is a statement',
      chainId: 'eip155:1' as CaipNetworkId,
      uri: 'siwx://example.com',
      version: '1',
      nonce: '123',
      ...replaces.data
    },
    message: replaces.message || 'Hello AppKit!',
    signature:
      replaces.signature ||
      '0x3c70e0a2d87f677dc0c3faf98fdf6313e99a3d9191bb79f7ecfce0c2cf46b7b33fd4c4bb83bca82fe872e35963382027d0d18018342d7dc36a675918cb73e9061c'
  }
}
