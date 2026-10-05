import type UniversalProvider from '@walletconnect/universal-provider'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ConnectionController,
  ModalController,
  OptionsController,
  type SIWXConfig
} from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mockOptions } from '../mocks/Options.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

// -- Setup --------------------------------------------------------------------
function createUniversalProvider(session?: object) {
  return {
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn().mockResolvedValue(undefined),
    connect: vi.fn().mockResolvedValue(undefined),
    authenticate: vi.fn(),
    client: { core: { crypto: { getClientId: vi.fn().mockResolvedValue('client-id') } } },
    session
  }
}

async function createAppKit({
  universalProvider,
  ...options
}: Omit<Partial<typeof mockOptions>, 'universalProvider'> & {
  universalProvider: ReturnType<typeof createUniversalProvider>
}): Promise<AppKit> {
  const appkit = new AppKit({
    ...mockOptions,
    adapters: [],
    ...options,
    universalProvider: universalProvider as unknown as UniversalProvider
  })
  await appkit.ready()

  return appkit
}

function stubHostLaunch() {
  window.walletConnectHost = { autoConnect: true, postMessage: vi.fn() }
}

// -- Tests --------------------------------------------------------------------
describe('AppKit - host launch', () => {
  beforeAll(() => {
    mockWindowAndDocument()
    // The connect flow reads `window.navigator` for its platform checks
    Object.assign(window, { navigator })
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
  })

  beforeEach(() => {
    vi.spyOn(ModalController, 'open').mockResolvedValue(undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    delete window.walletConnectHost
    vi.restoreAllMocks()
  })

  it('connects once through Universal Provider and keeps the modal closed, even with SIWX', async () => {
    stubHostLaunch()
    const connectSpy = vi.spyOn(ConnectionController, 'connectWalletConnect')
    const universalProvider = createUniversalProvider()

    await createAppKit({
      universalProvider,
      siwx: { getSessions: vi.fn().mockResolvedValue([]) } as unknown as SIWXConfig
    })

    await vi.waitFor(() => expect(universalProvider.connect).toHaveBeenCalledOnce())
    expect(connectSpy).toHaveBeenCalledOnce()
    expect(connectSpy).toHaveBeenCalledWith({ cache: 'never' })
    expect(universalProvider.authenticate).not.toHaveBeenCalled()
    expect(ModalController.open).not.toHaveBeenCalled()
  })

  it('does not connect again when a session was restored', async () => {
    stubHostLaunch()
    const connectSpy = vi.spyOn(ConnectionController, 'connectWalletConnect')

    await createAppKit({ universalProvider: createUniversalProvider({ namespaces: {} }) })

    expect(connectSpy).not.toHaveBeenCalled()
  })

  it('does not reconnect after a disconnect', async () => {
    stubHostLaunch()
    const connectSpy = vi.spyOn(ConnectionController, 'connectWalletConnect').mockResolvedValue()

    const appkit = await createAppKit({ universalProvider: createUniversalProvider() })
    await vi.waitFor(() => expect(connectSpy).toHaveBeenCalledOnce())

    await appkit.disconnect()
    ;(appkit as any).autoConnectHostLaunch()

    expect(connectSpy).toHaveBeenCalledOnce()
  })

  it('does not auto-connect on a regular launch', async () => {
    const connectSpy = vi.spyOn(ConnectionController, 'connectWalletConnect')

    await createAppKit({ universalProvider: createUniversalProvider() })

    expect(connectSpy).not.toHaveBeenCalled()
  })

  it('leaves the connection to the app with manualWCControl', async () => {
    stubHostLaunch()
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      manualWCControl: true
    })
    const connectSpy = vi.spyOn(ConnectionController, 'connectWalletConnect')

    await createAppKit({ universalProvider: createUniversalProvider(), manualWCControl: true })

    expect(connectSpy).not.toHaveBeenCalled()
  })
})
