import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'

import {
  ApiController,
  ChainController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  NetworkUtil,
  OptionsController,
  PublicStateController,
  RouterController
} from '../../exports/index.js'

const mockBitcoinNetwork: CaipNetwork = {
  id: '000000000019d6689c085ae165831e93',
  caipNetworkId: 'bip122:000000000019d6689c085ae165831e93',
  chainNamespace: 'bip122',
  name: 'BIP122',
  rpcUrls: {
    default: {
      http: ['https://rpc.bip122.org']
    }
  },
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  }
}

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
    ChainController.state.activeChain = 'eip155'
    ChainController.state.chains.set(namespace, {
      networkState: {
        supportsAllNetworks: false,
        caipNetwork: mockBitcoinNetwork
      }
    })
    vi.spyOn(ModalController, 'setLoading')
    vi.spyOn(NetworkUtil, 'onSwitchNetwork')

    await ModalController.open({ namespace })

    expect(NetworkUtil.onSwitchNetwork).toHaveBeenCalled()
    expect(ModalController.setLoading).toHaveBeenCalledWith(true, namespace)
  })

  it('should not call switchActiveNamespace if namespace parameter is the same', async () => {
    const namespace = 'bip122'
    ChainController.state.chains.set(namespace, {
      networkState: {
        supportsAllNetworks: false,
        caipNetwork: mockBitcoinNetwork
      }
    })
    vi.spyOn(ChainController, 'switchActiveNetwork')

    await ModalController.open({ namespace })

    expect(ChainController.switchActiveNetwork).not.toHaveBeenCalled()
  })

  it('should check account depending on namespace when calling open()', async () => {
    ChainController.state.noAdapters = false
    ChainController.state.activeChain = 'eip155'
    vi.spyOn(NetworkUtil, 'onSwitchNetwork')
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      currentTab: 0,
      tokenBalance: [],
      smartAccountDeployed: false,
      addressLabels: new Map(),
      user: undefined,
      caipAddress: 'eip155:1:0x123'
    })
    ChainController.state.chains.set('bip122', {
      networkState: {
        supportsAllNetworks: false,
        caipNetwork: mockBitcoinNetwork
      }
    })

    const resetSpy = vi.spyOn(RouterController, 'reset')

    await ModalController.open({ namespace: 'eip155' })

    expect(resetSpy).toHaveBeenCalledWith('Account')

    await ModalController.open({ namespace: 'bip122' })

    expect(NetworkUtil.onSwitchNetwork).toHaveBeenCalled()
  })

  it('should not open the ConnectingWalletConnectBasic modal view when connected and manualWCControl is false', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      manualWCControl: false
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
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
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      manualWCControl: true
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      noAdapters: true
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
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
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      noAdapters: false
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
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
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      noAdapters: false
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: undefined
    } as any)
    vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    const resetSpy = vi.spyOn(RouterController, 'reset')

    await ModalController.open()

    expect(resetSpy).toHaveBeenCalledWith('ConnectingWalletConnectBasic')
  })

  describe('clearLoading', () => {
    it('should clear internal loading state', () => {
      ModalController.state.loading = true
      ModalController.state.loadingNamespaceMap.set('eip155', true)
      ModalController.state.loadingNamespaceMap.set('bip122', true)

      ModalController.clearLoading()

      expect(ModalController.state.loading).toBe(false)
      expect(ModalController.state.loadingNamespaceMap.size).toBe(0)
    })

    it('should update PublicStateController when clearing loading state', () => {
      const publicStateSetSpy = vi.spyOn(PublicStateController, 'set')
      ModalController.state.loading = true

      ModalController.clearLoading()

      expect(publicStateSetSpy).toHaveBeenCalledWith({ loading: false })
    })

    it('should clear both internal state and PublicStateController consistently', () => {
      const publicStateSetSpy = vi.spyOn(PublicStateController, 'set')
      ModalController.state.loading = true
      ModalController.state.loadingNamespaceMap.set('eip155', true)

      ModalController.clearLoading()

      expect(ModalController.state.loading).toBe(false)
      expect(ModalController.state.loadingNamespaceMap.size).toBe(0)
      expect(publicStateSetSpy).toHaveBeenCalledWith({ loading: false })
    })
  })

  describe('close method loading state handling', () => {
    it('should clear loading state when modal is closed', () => {
      const clearLoadingSpy = vi.spyOn(ModalController, 'clearLoading')
      vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})
      ModalController.state.open = true

      ModalController.close()

      expect(clearLoadingSpy).toHaveBeenCalled()
    })

    it('should sync PublicStateController loading state when modal is closed', () => {
      const publicStateSetSpy = vi.spyOn(PublicStateController, 'set')
      vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})
      ModalController.state.open = true
      ModalController.state.loading = true

      ModalController.close()

      expect(publicStateSetSpy).toHaveBeenCalledWith({ loading: false })
    })
  })
})
