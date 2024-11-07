import type { SIWXSession } from '@reown/appkit-core'

type MockSessionReplaces = {
  [K in keyof SIWXSession]?: Partial<SIWXSession[K]>
}

export function mockSession(
  replaces: MockSessionReplaces = { message: {}, signature: '' }
): SIWXSession {
  return {
    message: {
      domain: 'example.com',
      accountAddress: '0xb3F068DCc2f92ED42E0417d4f2C2191f743fBfdA',
      statement: 'This is a statement',
      chainId: 'eip155:1',
      uri: 'siwx://example.com',
      version: '1',
      nonce: '123',
      toString: () => 'Hello AppKit!',
      ...replaces.message
    },
    signature:
      replaces.signature ||
      '0x3c70e0a2d87f677dc0c3faf98fdf6313e99a3d9191bb79f7ecfce0c2cf46b7b33fd4c4bb83bca82fe872e35963382027d0d18018342d7dc36a675918cb73e9061c'
  }
}
