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
    ConnectionController.setIsHostLaunchConnecting(false)
  })

  it('does not open the unsupported network modal while connecting to the wallet', () => {
    ChainController.showUnsupportedChainUI()
    expect(ModalController.open).toHaveBeenCalledWith({ view: 'UnsupportedChain' })

    vi.mocked(ModalController.open).mockClear()
    stubHostLaunch()
    ConnectionController.setIsHostLaunchConnecting(true)
    ChainController.showUnsupportedChainUI()
    expect(ModalController.open).not.toHaveBeenCalled()

    // Once connected, it opens as on any other launch
    ConnectionController.setIsHostLaunchConnecting(false)
    ChainController.showUnsupportedChainUI()
    expect(ModalController.open).toHaveBeenCalledWith({ view: 'UnsupportedChain' })
  })

  it('signs in directly in the wallet on a host launch, once the connection settles', async () => {
    const requestSignMessageSpy = vi
      .spyOn(SIWXUtil, 'requestSignMessage')
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 10)))

    await SIWXUtil.initializeIfEnabled(caipAddress)
    expect(ModalController.open).toHaveBeenCalledWith({ view: 'SIWXSignMessage' })
    expect(requestSignMessageSpy).not.toHaveBeenCalled()

    vi.mocked(ModalController.open).mockClear()
    stubHostLaunch()
    ConnectionController.setIsHostLaunchConnecting(true)
    await SIWXUtil.initializeIfEnabled(caipAddress)
    expect(requestSignMessageSpy).not.toHaveBeenCalled()

    // Overlapping calls share one signature request, without the Sign In view
    ConnectionController.setIsHostLaunchConnecting(false)
    await Promise.all([
      SIWXUtil.initializeIfEnabled(caipAddress),
      SIWXUtil.initializeIfEnabled(caipAddress)
    ])
    expect(requestSignMessageSpy).toHaveBeenCalledOnce()
    expect(ModalController.open).not.toHaveBeenCalled()
  })

  it('skips email capture on a host launch', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      siwx: mockSIWX,
      remoteFeatures: { emailCapture: true }
    })
    const requestSignMessageSpy = vi.spyOn(SIWXUtil, 'requestSignMessage').mockResolvedValue()

    stubHostLaunch()
    await SIWXUtil.initializeIfEnabled(caipAddress)

    expect(ModalController.open).not.toHaveBeenCalled()
    expect(requestSignMessageSpy).toHaveBeenCalledOnce()
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
