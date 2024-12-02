import type { Provider as SatsConnectProvider, BitcoinProvider, RpcError } from 'sats-connect'
import { vi } from 'vitest'

export function mockSatsConnectProvider(replaces: Partial<SatsConnectProvider> = {}): {
  provider: SatsConnectProvider
  wallet: BitcoinProvider
} {
  const id = replaces.id || 'mock_provider_id'

  const wallet = mockSatsConnectWindowProvider(id)

  const provider: SatsConnectProvider = {
    id,
    icon: 'mock_icon',
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

export function mockSatsConnectWindowProvider(id: string) {
  const windowProvider: BitcoinProvider = {
    addListener: vi.fn(),
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
    signTransaction: vi.fn(),
    getCapabilities: vi.fn()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any)[id] = windowProvider

  return windowProvider
}
