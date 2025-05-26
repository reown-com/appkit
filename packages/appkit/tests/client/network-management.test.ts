import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AdapterNetworkState, CaipNetwork } from '@reown/appkit'
import { ConstantsUtil } from '@reown/appkit-common'
import { ApiController, ChainController, OptionsController } from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mainnet, polygon } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Network Management', () => {
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

  it('should set CAIP network', () => {
    const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

    const appKit = new AppKit(mockOptions)
    appKit.setCaipNetwork(mainnet)

    expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
  })

  it('should get CAIP network', () => {
    const appKit = new AppKit(mockOptions)

    expect(appKit.getCaipNetwork()).toEqual(mainnet)
  })

  it('should set requested CAIP networks', () => {
    const setRequestedCaipNetworks = vi.spyOn(ChainController, 'setRequestedCaipNetworks')
    const requestedNetworks = [mainnet] as unknown as CaipNetwork[]

    const appKit = new AppKit(mockOptions)
    appKit.setRequestedCaipNetworks(requestedNetworks, mainnet.chainNamespace)

    expect(setRequestedCaipNetworks).toHaveBeenCalledWith(requestedNetworks, mainnet.chainNamespace)
  })

  it('should get approved CAIP network IDs', () => {
    const getAllApprovedCaipNetworkIds = vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds')
    getAllApprovedCaipNetworkIds.mockReturnValueOnce([mainnet.caipNetworkId])

    const appKit = new AppKit(mockOptions)

    expect(appKit.getApprovedCaipNetworkIds()).toEqual(['eip155:1'])
  })

  it('should set approved CAIP networks data', () => {
    const setApprovedCaipNetworksData = vi.spyOn(ChainController, 'setApprovedCaipNetworksData')

    const appKit = new AppKit(mockOptions)
    appKit.setApprovedCaipNetworksData('eip155')

    expect(setApprovedCaipNetworksData).toHaveBeenCalledWith('eip155')
  })

  it('should reset network', () => {
    const resetNetwork = vi.spyOn(ChainController, 'resetNetwork')

    const appKit = new AppKit(mockOptions)
    appKit.resetNetwork(mainnet.chainNamespace)

    expect(resetNetwork).toHaveBeenCalled()
  })

  it('should switch network when requested', async () => {
    const switchActiveNetwork = vi
      .spyOn(ChainController, 'switchActiveNetwork')
      .mockResolvedValue(undefined)
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue([mainnet, polygon])
    // Mock the network validation to ensure the switch is allowed
    vi.spyOn(ChainController, 'getNetworkData').mockReturnValue({
      requestedCaipNetworks: [mainnet, polygon],
      approvedCaipNetworkIds: [mainnet.caipNetworkId, polygon.caipNetworkId],
      supportsAllNetworks: false
    } as any)

    const appKit = new AppKit(mockOptions)
    await appKit.switchNetwork(mainnet)
    expect(switchActiveNetwork).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mainnet.id,
        name: mainnet.name
      })
    )

    await appKit.switchNetwork(polygon)

    expect(switchActiveNetwork).toHaveBeenCalledTimes(2)
  })

  it('should set smart account enabled networks', () => {
    const networks = [1, 137]
    const setSmartAccountEnabledNetworks = vi.spyOn(
      ChainController,
      'setSmartAccountEnabledNetworks'
    )

    const appKit = new AppKit(mockOptions)
    appKit.setSmartAccountEnabledNetworks(networks, mainnet.chainNamespace)

    expect(setSmartAccountEnabledNetworks).toHaveBeenCalledWith(networks, mainnet.chainNamespace)
  })

  it('should handle network switcher UI when enableNetworkSwitch is true', async () => {
    // Set up spies before overriding mocks
    const showUnsupportedChainUI = vi.spyOn(ChainController, 'showUnsupportedChainUI')
    const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

    // Override the default mocks for this specific test
    vi.spyOn(ChainController, 'getNetworkData').mockReturnValue(
      mainnet as unknown as AdapterNetworkState
    )
    vi.spyOn(ChainController, 'getCaipNetworkByNamespace').mockReturnValue(mainnet)
    vi.spyOn(ChainController, 'getNetworkProp').mockReturnValue(true)

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: {
        ...mainnet,
        name: ConstantsUtil.UNSUPPORTED_NETWORK_NAME
      },
      activeChain: 'eip155'
    })

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      projectId: 'test-project-id',
      allowUnsupportedChain: false,
      enableNetworkSwitch: true
    })

    const appKit = new AppKit(mockOptions)

    // Wait for initialization to complete
    await appKit.ready()

    await appKit['syncAccount']({
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    })

    expect(showUnsupportedChainUI).toHaveBeenCalled()
    expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
  })

  it('should handle network switcher UI when enableNetworkSwitch is false', async () => {
    vi.spyOn(ChainController, 'getNetworkData').mockReturnValue(
      mainnet as unknown as AdapterNetworkState
    )
    vi.spyOn(ChainController, 'getCaipNetworkByNamespace').mockReturnValue(mainnet)
    vi.spyOn(ChainController, 'getNetworkProp').mockReturnValue(true)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: mainnet,
      activeChain: 'eip155'
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      allowUnsupportedChain: false,
      enableNetworkSwitch: false
    })

    const showUnsupportedChainUI = vi.spyOn(ChainController, 'showUnsupportedChainUI')
    const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

    const appKit = new AppKit(mockOptions)
    await appKit['syncAccount']({
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    })

    expect(showUnsupportedChainUI).not.toHaveBeenCalled()
    expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
  })
})
