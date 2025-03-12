import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ApiController,
  ChainController,
  ConnectorController,
  ModalController,
  RouterController
} from '../../exports/index.js'

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
})
