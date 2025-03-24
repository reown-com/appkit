import type { BitcoinProvider, RpcError, Provider as SatsConnectProvider } from 'sats-connect'
import { type Mock, vi } from 'vitest'

type SatsConnectWindowProviderMock = {
  [K in keyof Omit<BitcoinProvider, 'getCapabilities'>]: Mock<BitcoinProvider[K]>
}

export function mockSatsConnectProvider(replaces: Partial<SatsConnectProvider> = {}): {
  provider: SatsConnectProvider
  wallet: SatsConnectWindowProviderMock
} {
  const id = replaces.id || 'mock_provider_id'

  const wallet = mockSatsConnectWindowProvider(id)

  const provider: SatsConnectProvider = {
    id,
    icon: 'data:image/svg;',
    name: 'mock_provider_name',
    chromeWebStoreUrl: '',
    googlePlayStoreUrl: '',
    iOSAppStoreUrl: '',
    methods: ['getAddresses', 'signPsbt', 'sendTransfer', 'signMessage'],
    mozillaAddOnsUrl: '',
    webUrl: '',
    ...replaces
  }

  if (window.btc_providers) {
    window.btc_providers = window.btc_providers.filter(p => p.id !== id)
    window.btc_providers.push(provider)
  } else {
    window.btc_providers = [provider]
  }

  return { provider, wallet }
}

mockSatsConnectProvider.mockRequestResolve = <T>(result: T) => ({
  id: 'mock_request_id',
  jsonrpc: '2.0' as const,
  result
})

mockSatsConnectProvider.mockRequestReject = (error: Partial<RpcError> = {}) => ({
  id: 'mock_request_id',
  jsonrpc: '2.0' as const,
  error: {
    code: -32000,
    message: 'Mocked error',
    ...error
  } satisfies RpcError
})

export function mockSatsConnectWindowProvider(id: string): SatsConnectWindowProviderMock {
  const windowProvider = {
    addListener: vi.fn(() => () => undefined),
    connect: vi.fn(),
    createInscription: vi.fn(),
    createRepeatInscriptions: vi.fn(),
    request: vi.fn(() =>
      Promise.resolve({
        id: 'mock_request_id',
        jsonrpc: '2.0' as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: {} as any
      })
    ),
    sendBtcTransaction: vi.fn(),
    signMessage: vi.fn(),
    signMultipleTransactions: vi.fn(),
    signTransaction: vi.fn()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any)[id] = windowProvider

  return windowProvider
}
