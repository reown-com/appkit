import type UniversalProvider from '@walletconnect/universal-provider'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ConnectionController,
  ConnectorController,
  ModalController,
  OptionsController,
  type SIWXConfig,
  StorageUtil
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
    ModalController.clearLoading()
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

  it('detects the host launch through Universal Provider', async () => {
    await createAppKit({ universalProvider: createUniversalProvider({ namespaces: {} }) })
    expect(ConnectionController.state.isHostLaunch).toBe(false)

    stubHostLaunch()
    await createAppKit({ universalProvider: createUniversalProvider({ namespaces: {} }) })
    expect(ConnectionController.state.isHostLaunch).toBe(true)
  })

  it('shows the connect button as loading until the wallet connects', async () => {
    stubHostLaunch()
    let resolveConnect = () => {}
    vi.spyOn(ConnectionController, 'connectWalletConnect').mockReturnValue(
      new Promise<void>(resolve => {
        resolveConnect = resolve
      })
    )

    const appkit = await createAppKit({ universalProvider: createUniversalProvider() })
    // Other startup flows, like the embedded wallet sync, don't hide it
    appkit.setLoading(false, 'eip155')

    expect(ModalController.state.loading).toBe(true)
    expect(ModalController.state.loadingNamespaceMap.get('eip155')).toBe(true)

    resolveConnect()
    await vi.waitFor(() => expect(ModalController.state.loading).toBe(false))
    expect(ModalController.state.loadingNamespaceMap.get('eip155')).toBe(false)
  })

  it('shows the connect button as loading while a session is restored on a wallet launch', async () => {
    vi.spyOn(StorageUtil, 'getConnectionStatus').mockReturnValue('connected')
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockImplementation(namespace =>
      namespace === 'eip155' ? ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT : undefined
    )
    const loadingDuringRestore: unknown[] = []
    vi.spyOn(AppKit.prototype as any, 'reconnectWalletConnect').mockImplementation(async () => {
      loadingDuringRestore.push(ModalController.state.loadingNamespaceMap.get('eip155'))
    })

    // A regular launch restores the session as before, without the loading state
    await createAppKit({ universalProvider: createUniversalProvider({ namespaces: {} }) })
    expect(loadingDuringRestore).toEqual([undefined])

    stubHostLaunch()
    await createAppKit({ universalProvider: createUniversalProvider({ namespaces: {} }) })

    expect(loadingDuringRestore).toEqual([undefined, true])
    expect(ModalController.state.loadingNamespaceMap.get('eip155')).toBe(false)
    expect(ConnectorController.getConnectorId('eip155')).toBe(
      ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )
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
