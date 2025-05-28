import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SIWXConfig } from '@reown/appkit'
import { SafeLocalStorage } from '@reown/appkit-common'
import {
  AccountController,
  ApiController,
  ChainController,
  ConnectionController,
  EventsController,
  OptionsController,
  PublicStateController,
  SnackController
} from '@reown/appkit-controllers'
import { CaipNetworksUtil, ProviderUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client/appkit.js'
import { mockUniversalAdapter } from '../mocks/Adapter.js'
import { base, mainnet } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('State Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider as any)
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockResolvedValue(['http://localhost:3000'])

    // Mock ChainController.initialize to prevent initialization errors
    vi.spyOn(ChainController, 'initialize').mockImplementation(() => Promise.resolve())

    // Mock ChainController methods that access internal state
    vi.spyOn(ChainController, 'getNetworkData').mockReturnValue({
      requestedCaipNetworks: [mainnet],
      approvedCaipNetworkIds: [mainnet.caipNetworkId],
      supportsAllNetworks: false
    } as any)

    vi.spyOn(ChainController, 'getCaipNetworkByNamespace').mockReturnValue(mainnet)
    vi.spyOn(ChainController, 'getNetworkProp').mockReturnValue(true)
    vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds').mockReturnValue([
      mainnet.caipNetworkId
    ])

    // Mock OptionsController state to provide default values
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      projectId: 'test-project-id',
      enableNetworkSwitch: true,
      allowUnsupportedChain: false
    })

    // Mock ChainController state to provide default values
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: mainnet,
      activeChain: 'eip155'
    })
  })

  it('should subscribe to address updates', () => {
    const subscribe = vi.spyOn(AccountController, 'subscribeKey')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeShouldUpdateToAddress(callback)

    expect(subscribe).toHaveBeenCalledWith('shouldUpdateToAddress', callback)
  })

  it('should subscribe to CAIP network changes', () => {
    const subscribeKey = vi.spyOn(ChainController, 'subscribeKey')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeCaipNetworkChange(callback)

    expect(subscribeKey).toHaveBeenCalledWith('activeCaipNetwork', callback)
  })

  it('should subscribe to state changes', () => {
    const subscribe = vi.spyOn(PublicStateController, 'subscribe')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeState(callback)

    expect(subscribe).toHaveBeenCalledWith(callback)
  })

  it('should show error message', () => {
    const showError = vi.spyOn(SnackController, 'showError')

    const appKit = new AppKit(mockOptions)
    appKit.showErrorMessage('Test error')

    expect(showError).toHaveBeenCalledWith('Test error')
  })

  it('should show success message', () => {
    const showSuccess = vi.spyOn(SnackController, 'showSuccess')

    const appKit = new AppKit(mockOptions)
    appKit.showSuccessMessage('Test success')

    expect(showSuccess).toHaveBeenCalledWith('Test success')
  })

  it('should get event', () => {
    const appKit = new AppKit(mockOptions)

    expect(appKit.getEvent()).toEqual(EventsController.state)
  })

  it('should subscribe to events', () => {
    const subscribe = vi.spyOn(EventsController, 'subscribe')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeEvents(callback)

    expect(subscribe).toHaveBeenCalledWith(callback)
  })

  it('should reset WC connection', () => {
    const resetWcConnection = vi.spyOn(ConnectionController, 'resetWcConnection')

    const appKit = new AppKit(mockOptions)
    appKit.resetWcConnection()

    expect(resetWcConnection).toHaveBeenCalled()
  })

  it('should disconnect correctly', async () => {
    const disconnect = vi.spyOn(ConnectionController, 'disconnect')
    // Mock the disconnect to resolve successfully instead of throwing
    disconnect.mockResolvedValueOnce(undefined)

    const mockRemoveItem = vi.fn()
    vi.spyOn(SafeLocalStorage, 'removeItem').mockImplementation(mockRemoveItem)

    const appKit = new AppKit({
      ...mockOptions,
      networks: [base],
      adapters: [mockUniversalAdapter]
    })
    await appKit.disconnect()

    expect(disconnect).toHaveBeenCalled()
  })

  it('should set status to connected on syncWalletConnectAccount if CAIP address exists', async () => {
    vi.spyOn(ChainController, 'setApprovedCaipNetworksData').mockImplementation(() =>
      Promise.resolve()
    )
    ChainController.state.activeCaipNetwork = mainnet
    vi.spyOn(CaipNetworksUtil, 'extendCaipNetworks').mockReturnValue([mainnet])
    vi.spyOn(ChainController, 'initialize').mockImplementation(() => Promise.resolve())
    vi.spyOn(AccountController, 'setUser').mockImplementation(() => Promise.resolve())

    const universalProvider = {
      ...mockUniversalProvider,
      session: {
        peer: {
          metadata: {
            name: 'Test Provider'
          }
        },
        namespaces: {
          eip155: {
            accounts: ['eip155:1:0x123']
          }
        }
      }
    } as unknown as InstanceType<typeof UniversalProvider>
    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(universalProvider)
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue('WALLET_CONNECT')

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [],
      networks: [mainnet]
    })
    appKit['universalProvider'] = universalProvider

    const setStatusSpy = vi.spyOn(appKit, 'setStatus')

    await appKit['syncWalletConnectAccount']()

    expect(setStatusSpy).toHaveBeenCalledWith('connected', 'eip155')
  })

  it('should set status to disconnected on syncWalletConnectAccount if CAIP address does not exist', async () => {
    vi.spyOn(ChainController, 'setApprovedCaipNetworksData').mockImplementation(() =>
      Promise.resolve()
    )
    ChainController.state.activeCaipNetwork = mainnet
    vi.spyOn(CaipNetworksUtil, 'extendCaipNetworks').mockReturnValue([mainnet])
    vi.spyOn(ChainController, 'initialize').mockImplementation(() => Promise.resolve())
    vi.spyOn(AccountController, 'setUser').mockImplementation(() => Promise.resolve())
    const universalProvider = {
      ...mockUniversalProvider,
      session: {
        peer: {
          metadata: {
            name: 'Test Provider'
          }
        },
        namespaces: {
          eip155: {
            accounts: []
          }
        }
      }
    } as unknown as InstanceType<typeof UniversalProvider>
    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(universalProvider)
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue('WALLET_CONNECT')

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [],
      networks: [mainnet]
    })
    appKit['universalProvider'] = universalProvider

    const setStatusSpy = vi.spyOn(appKit, 'setStatus')

    await appKit['syncWalletConnectAccount']()

    expect(setStatusSpy).toHaveBeenCalledWith('disconnected', 'eip155')
  })

  it.each([undefined, {} as SIWXConfig])('should set and get SIWX correctly', async siwx => {
    const setSIWXSpy = vi.spyOn(OptionsController, 'setSIWX')

    // Mock the OptionsController state for this specific test
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      projectId: 'test-project-id',
      enableNetworkSwitch: true,
      allowUnsupportedChain: false,
      siwx
    } as any)

    const appKit = new AppKit({ ...mockOptions, siwx })
    await appKit.ready()
    expect(setSIWXSpy).toHaveBeenCalledWith(siwx)

    // Mock the state again for the getSIWX call
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      projectId: 'test-project-id',
      siwx
    } as any)
    expect(appKit.getSIWX()).toEqual(siwx)
  })
})
