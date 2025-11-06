import { vi } from 'vitest'

import type { TonWalletInfoInjectable } from '@reown/appkit-utils/ton'

export function mockTonProvider(config?: { name?: string }) {
  const walletInfo: TonWalletInfoInjectable = {
    name: config?.name || 'MockTonWallet',
    appName: 'mock_ton_wallet',
    imageUrl: 'data:image/png;base64,mock',
    aboutUrl: 'https://mock.wallet',
    platforms: ['chrome'],
    jsBridgeKey: 'mockTonWallet',
    injected: true,
    embedded: false
  }

  const wallet = {
    ...walletInfo,
    connect: vi.fn().mockResolvedValue('mock_ton_address'),
    disconnect: vi.fn().mockResolvedValue(undefined),
    restoreConnection: vi.fn().mockResolvedValue({
      event: 'connect',
      payload: { items: [{ name: 'ton_addr', address: 'mock_ton_address' }] }
    }),
    send: vi.fn().mockResolvedValue({ result: 'mock_result' }),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    listen: vi.fn().mockReturnValue(() => {})
  }

  return { wallet, walletInfo }
}
