import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ApiController,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  OptionsController,
  RouterController
} from '../../exports/index.js'

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValueOnce(false)
  })

  it('should have valid default state', () => {
    expect(ModalController.state.open).toEqual(false)
  })

  // Skipping for now, need to figure out a way to test this with new prefetch check
  it.skip('should update state correctly on open()', () => {
    ModalController.open()
    expect(ModalController.state.open).toEqual(true)
  })

  it('should update state correctly on close()', () => {
    ModalController.close()
    expect(ModalController.state.open).toEqual(false)
  })

  it('should prefetch when open() is called', async () => {
    vi.spyOn(ApiController, 'fetchFeaturedWallets')
    vi.spyOn(ApiController, 'fetchRecommendedWallets')
    vi.spyOn(ApiController, 'fetchConnectorImages')
    vi.spyOn(ApiController, 'fetchNetworkImages')

    await ModalController.open()

    expect(ApiController.fetchFeaturedWallets).toHaveBeenCalledOnce()
    expect(ApiController.fetchRecommendedWallets).toHaveBeenCalledOnce()
    expect(ApiController.fetchConnectorImages).toHaveBeenCalledOnce()
    expect(ApiController.fetchNetworkImages).toHaveBeenCalledOnce()
  })

  it('should handle namespace parameter correctly in open()', async () => {
    const namespace = 'bip122'
    vi.spyOn(ConnectorController, 'setFilterByNamespace')
    vi.spyOn(ChainController, 'switchActiveNamespace')
    vi.spyOn(ModalController, 'setLoading')

    await ModalController.open({ namespace })

    expect(ConnectorController.setFilterByNamespace).toHaveBeenCalledWith(namespace)
    expect(ChainController.switchActiveNamespace).toHaveBeenCalledWith(namespace)
    expect(ModalController.setLoading).toHaveBeenCalledWith(true, namespace)
  })

  it('should not call switchActiveNamespace if namespace parameter is the same', async () => {
    const namespace = 'bip122'
    ChainController.switchActiveNamespace(namespace)
    vi.spyOn(ChainController, 'switchActiveNetwork')

    await ModalController.open({ namespace })

    expect(ChainController.switchActiveNetwork).not.toHaveBeenCalled()
  })

  it('should check account depending on namespace when calling open()', async () => {
    ChainController.state.noAdapters = false
    vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
      currentTab: 0,
      tokenBalance: [],
      smartAccountDeployed: false,
      addressLabels: new Map(),
      allAccounts: [],
      user: undefined,
      caipAddress: 'eip155:1:0x123'
    })

    const resetSpy = vi.spyOn(RouterController, 'reset')

    await ModalController.open({ namespace: 'eip155' })

    expect(resetSpy).toHaveBeenCalledWith('Account')

    await ModalController.open({ namespace: 'bip122' })

    expect(resetSpy).toHaveBeenCalledWith('Connect')
  })

  it('should not open the ConnectingWalletConnectBasic modal view when connected and manualWCControl is false', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
      ...OptionsController.state,
      manualWCControl: false
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValueOnce({
      ...ChainController.state,
      noAdapters: true
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
      caipAddress: 'eip155:0x123'
    } as any)
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    const resetSpy = vi.spyOn(RouterController, 'reset')

    await ModalController.open()

    expect(resetSpy).not.toHaveBeenCalledWith('ConnectingWalletConnectBasic')
  })

  it('should open the ConnectingWalletConnectBasic modal view when connected and manualWCControl is true', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
      ...OptionsController.state,
      manualWCControl: true
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValueOnce({
      ...ChainController.state,
      noAdapters: true
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
      caipAddress: undefined
    } as any)
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    const resetSpy = vi.spyOn(RouterController, 'reset')

    await ModalController.open()

    expect(resetSpy).toHaveBeenCalledWith('ConnectingWalletConnectBasic')
  })

  it('should not open the ConnectingWalletConnectBasic modal view when not connected and manualWCControl is false', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
      ...OptionsController.state,
      manualWCControl: false
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValueOnce({
      ...ChainController.state,
      noAdapters: false
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
      caipAddress: undefined
    } as any)
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    const resetSpy = vi.spyOn(RouterController, 'reset')

    await ModalController.open()

    expect(resetSpy).not.toHaveBeenCalledWith('ConnectingWalletConnectBasic')
  })

  it('should open the ConnectingWalletConnectBasic modal view when not connected and manualWCControl is true', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
      ...OptionsController.state,
      manualWCControl: true
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValueOnce({
      ...ChainController.state,
      noAdapters: false
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
      caipAddress: undefined
    } as any)
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    const resetSpy = vi.spyOn(RouterController, 'reset')

    await ModalController.open()

    expect(resetSpy).toHaveBeenCalledWith('ConnectingWalletConnectBasic')
  })
})
