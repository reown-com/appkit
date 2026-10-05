import type UniversalProvider from '@walletconnect/universal-provider'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  ConnectorController,
  ModalController,
  OptionsController,
  type SIWXConfig,
  SIWXUtil,
  StorageUtil
} from '@reown/appkit-controllers'
import { CaipNetworksUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client/appkit.js'
import { mainnet } from '../mocks/Networks.js'
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

const address = '0x1234567890123456789012345678901234567890'

function setUnsupportedNetwork() {
  ChainController.setActiveCaipNetwork(CaipNetworksUtil.getUnsupportedNetwork('eip155:999'))
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
    // Don't let a stored unsupported network leak into the next test's startup
    localStorage.clear()
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

  it('signs in with SIWX in the wallet once the first connection settles', async () => {
    stubHostLaunch()
    let resolveConnect = () => {}
    vi.spyOn(ConnectionController, 'connectWalletConnect').mockReturnValue(
      new Promise<void>(resolve => {
        resolveConnect = resolve
      })
    )
    const requestSignMessageSpy = vi.spyOn(SIWXUtil, 'requestSignMessage').mockResolvedValue()

    const appkit = await createAppKit({
      universalProvider: createUniversalProvider(),
      siwx: { getSessions: vi.fn().mockResolvedValue([]) } as unknown as SIWXConfig
    })
    appkit.setCaipAddress(`eip155:1:${address}`, 'eip155')
    // Not while connecting
    expect(requestSignMessageSpy).not.toHaveBeenCalled()

    resolveConnect()
    await vi.waitFor(() => expect(requestSignMessageSpy).toHaveBeenCalledOnce())
    // Only the wallet asks to sign: no Sign In view in AppKit
    expect(ModalController.open).not.toHaveBeenCalled()
  })

  it('shows the unsupported network modal once the first connection lands on one', async () => {
    stubHostLaunch()
    let resolveConnect = () => {}
    vi.spyOn(ConnectionController, 'connectWalletConnect').mockImplementation(
      () =>
        new Promise<void>(resolve => {
          setUnsupportedNetwork()
          resolveConnect = resolve
        })
    )

    const appkit = await createAppKit({ universalProvider: createUniversalProvider() })
    // Held back while connecting
    expect(ModalController.open).not.toHaveBeenCalled()

    appkit.setCaipAddress(`eip155:999:${address}`, 'eip155')
    resolveConnect()
    await vi.waitFor(() => expect(ConnectionController.state.isHostLaunchConnecting).toBe(false))

    expect(ModalController.open).toHaveBeenCalledOnce()
    expect(ModalController.open).toHaveBeenCalledWith({ view: 'UnsupportedChain' })
  })

  it('ignores an unsupported network stored on a previous visit', async () => {
    vi.spyOn(StorageUtil, 'getActiveCaipNetworkId').mockReturnValue('eip155:999')

    // A regular launch keeps it, as before
    await createAppKit({ universalProvider: createUniversalProvider({ namespaces: {} }) })
    expect(ChainController.state.activeCaipNetwork?.name).toBe(
      ConstantsUtil.UNSUPPORTED_NETWORK_NAME
    )

    vi.mocked(ModalController.open).mockClear()
    stubHostLaunch()
    await createAppKit({ universalProvider: createUniversalProvider({ namespaces: {} }) })

    expect(ChainController.state.activeCaipNetwork?.caipNetworkId).toBe(mainnet.caipNetworkId)
    expect(ModalController.open).not.toHaveBeenCalled()
  })

  it('shows the unsupported network modal when reconnecting to an unsupported network', async () => {
    stubHostLaunch()
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockImplementation(namespace =>
      namespace === 'eip155' ? ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT : undefined
    )
    vi.spyOn(AppKit.prototype as any, 'syncBalance').mockResolvedValue(undefined)
    const reconnect = (AppKit.prototype as any).reconnectWalletConnect
    vi.spyOn(AppKit.prototype as any, 'reconnectWalletConnect').mockImplementation(async function (
      this: any,
      ...args: unknown[]
    ) {
      await reconnect.apply(this, args)
      // The wallet moved to a chain the app doesn't support while the app was closed
      this.setUnsupportedNetwork(999)
      // Held back until the connection settles
      expect(ModalController.open).not.toHaveBeenCalled()
    })

    const appkit = await createAppKit({
      universalProvider: createUniversalProvider({
        namespaces: { eip155: { accounts: [`eip155:1:${address}`] } },
        peer: { metadata: { name: 'Wallet', description: '', url: '', icons: [] } }
      })
    })

    expect(appkit.getCaipAddress('eip155')).toBe(`eip155:999:${address}`)
    expect(ModalController.open).toHaveBeenCalledOnce()
    expect(ModalController.open).toHaveBeenCalledWith({ view: 'UnsupportedChain' })
  })

  it('does not connect again when a session was restored', async () => {
    stubHostLaunch()
    const connectSpy = vi.spyOn(ConnectionController, 'connectWalletConnect')

    await createAppKit({ universalProvider: createUniversalProvider({ namespaces: {} }) })

    expect(connectSpy).not.toHaveBeenCalled()
    // Reconnected on a supported network, so nothing to show
    expect(ModalController.open).not.toHaveBeenCalled()
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

  it('does not auto-connect when WalletConnect is disabled', async () => {
    stubHostLaunch()
    const connectSpy = vi.spyOn(ConnectionController, 'connectWalletConnect')

    await createAppKit({ universalProvider: createUniversalProvider(), enableWalletConnect: false })

    expect(connectSpy).not.toHaveBeenCalled()
    expect(ModalController.state.loading).toBe(false)
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
