import type UniversalProvider from '@walletconnect/universal-provider'
import { ref } from 'valtio/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ChainController, type SIWXConfig, SIWXUtil } from '../../exports/index.js'
import { extendedMainnet, mockChainControllerState } from '../../exports/testing.js'
import { ConnectionController } from '../../src/controllers/ConnectionController.js'
import { ModalController } from '../../src/controllers/ModalController.js'
import { OptionsController } from '../../src/controllers/OptionsController.js'

// -- Setup --------------------------------------------------------------------
const caipAddress = 'eip155:1:0x1234567890123456789012345678901234567890'
const mockSIWX = {
  createMessage: vi.fn(),
  addSession: vi.fn(),
  revokeSession: vi.fn(),
  setSessions: vi.fn(),
  getSessions: vi.fn()
} as unknown as SIWXConfig

function stubHostLaunch() {
  ConnectionController.setIsHostLaunch(true)
}

// -- Tests --------------------------------------------------------------------
describe('host launch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(ModalController, 'open').mockResolvedValue(undefined)
    vi.mocked(mockSIWX.getSessions).mockResolvedValue([])
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      siwx: mockSIWX
    })
    mockChainControllerState({
      activeCaipAddress: caipAddress,
      activeCaipNetwork: ref(extendedMainnet)
    })
    vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(true)
  })

  afterEach(() => {
    ConnectionController.setIsHostLaunch(false)
  })

  it('does not open the unsupported network modal on a host launch', () => {
    ChainController.showUnsupportedChainUI()
    expect(ModalController.open).toHaveBeenCalledWith({ view: 'UnsupportedChain' })

    vi.mocked(ModalController.open).mockClear()
    stubHostLaunch()
    ChainController.showUnsupportedChainUI()

    expect(ModalController.open).not.toHaveBeenCalled()
  })

  it('does not open the SIWX modal on a host launch', async () => {
    await SIWXUtil.initializeIfEnabled(caipAddress)
    expect(ModalController.open).toHaveBeenCalledWith({ view: 'SIWXSignMessage' })

    vi.mocked(ModalController.open).mockClear()
    stubHostLaunch()
    await SIWXUtil.initializeIfEnabled(caipAddress)

    expect(ModalController.open).not.toHaveBeenCalled()
  })

  it('connects without one-click auth on a host launch', async () => {
    stubHostLaunch()
    const universalProvider = { authenticate: vi.fn() } as unknown as UniversalProvider

    const isAuthenticated = await SIWXUtil.universalProviderAuthenticate({
      universalProvider,
      chains: ['eip155:1'],
      methods: []
    })

    expect(isAuthenticated).toBe(false)
    expect(universalProvider.authenticate).not.toHaveBeenCalled()
  })
})

describe('ConnectionController.isWalletConnectConnecting', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('is true only while AppKit connects WalletConnect', async () => {
    let resolveConnect = () => {}
    const connectWalletConnect = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveConnect = resolve
        })
    )
    vi.spyOn(ConnectionController, '_getClient').mockReturnValue({ connectWalletConnect } as any)

    const connecting = ConnectionController.connectWalletConnect({ cache: 'never' })
    expect(ConnectionController.isWalletConnectConnecting()).toBe(true)

    resolveConnect()
    await connecting
    expect(ConnectionController.isWalletConnectConnecting()).toBe(false)
  })

  it('resets after a failed connection', async () => {
    vi.spyOn(ConnectionController, '_getClient').mockReturnValue({
      connectWalletConnect: vi.fn().mockRejectedValue(new Error('rejected'))
    } as any)

    await expect(ConnectionController.connectWalletConnect({ cache: 'never' })).rejects.toThrow(
      'rejected'
    )
    expect(ConnectionController.isWalletConnectConnecting()).toBe(false)
  })
})
