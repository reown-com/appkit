import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ChainNamespace } from '@reown/appkit-common'

import { ApiController } from '../../src/controllers/ApiController.js'
import { ChainController } from '../../src/controllers/ChainController.js'
import { ConnectionController } from '../../src/controllers/ConnectionController.js'
import { ConnectorController } from '../../src/controllers/ConnectorController.js'
import { OptionsController } from '../../src/controllers/OptionsController.js'
import { PublicStateController } from '../../src/controllers/PublicStateController.js'
import { ConnectUtil, type WalletItem } from '../../src/utils/ConnectUtil.js'
import { ConnectionControllerUtil } from '../../src/utils/ConnectionControllerUtil.js'
import { ConnectorControllerUtil } from '../../src/utils/ConnectorControllerUtil.js'
import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil.js'
import { HeadlessWalletUtil } from '../../src/utils/HeadlessWalletUtil.js'
import { MobileWalletUtil } from '../../src/utils/MobileWallet.js'

const injectedWallet: WalletItem = {
  id: 'mm',
  name: 'MetaMask',
  imageUrl: 'icon',
  connectors: [{ id: 'io.metamask', chain: 'eip155' }],
  walletInfo: {},
  isInjected: true,
  isRecent: false
}

const apiWallet: WalletItem = {
  id: 'wc_wallet',
  name: 'Some Wallet',
  imageUrl: 'icon',
  connectors: [],
  walletInfo: {},
  isInjected: false,
  isRecent: false
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
    activeChain: 'eip155'
  } as never)
  vi.spyOn(PublicStateController, 'set').mockImplementation(vi.fn())
})

describe('HeadlessWalletUtil.fetchWallets', () => {
  it('searches when a search term is given', async () => {
    const searchWallet = vi
      .spyOn(ApiController, 'searchWallet')
      .mockResolvedValue(undefined as never)
    const fetchByPage = vi.spyOn(ApiController, 'fetchWalletsByPage')

    await HeadlessWalletUtil.fetchWallets({ search: 'rainbow', includePayOnly: true })

    expect(searchWallet).toHaveBeenCalledWith({ includePayOnly: true, search: 'rainbow' })
    expect(fetchByPage).not.toHaveBeenCalled()
  })

  it('maps the deprecated `query` to `search`', async () => {
    const searchWallet = vi
      .spyOn(ApiController, 'searchWallet')
      .mockResolvedValue(undefined as never)

    await HeadlessWalletUtil.fetchWallets({ query: 'rbw' })

    expect(searchWallet).toHaveBeenCalledWith({ search: 'rbw' })
  })

  it('lists from page 1 and clears prior search when no search term', async () => {
    const fetchByPage = vi
      .spyOn(ApiController, 'fetchWalletsByPage')
      .mockResolvedValue(undefined as never)
    ApiController.state.search = [{ id: 'stale' }] as never

    await HeadlessWalletUtil.fetchWallets({ sort: 'wcpay' })

    expect(ApiController.state.search).toEqual([])
    expect(fetchByPage).toHaveBeenCalledWith({ page: 1, sort: 'wcpay' })
  })
})

describe('HeadlessWalletUtil.getWalletList', () => {
  it('projects the initial + WalletConnect lists with pagination', () => {
    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([injectedWallet])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([apiWallet])
    ApiController.state.page = 2
    ApiController.state.count = 99

    expect(HeadlessWalletUtil.getWalletList()).toEqual({
      wallets: [injectedWallet],
      wcWallets: [apiWallet],
      page: 2,
      count: 99
    })
  })
})

describe('HeadlessWalletUtil.connect', () => {
  it('connects an injected wallet via its connector', async () => {
    const connector = { id: 'io.metamask' }
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(connector as never)
    const connectExternal = vi
      .spyOn(ConnectorControllerUtil, 'connectExternal')
      .mockResolvedValue(undefined as never)

    await HeadlessWalletUtil.connect(injectedWallet, 'eip155')

    expect(PublicStateController.set).toHaveBeenCalledWith({ connectingWallet: injectedWallet })
    expect(connectExternal).toHaveBeenCalledWith(connector)
  })

  it('falls back to a connector found by wallet id (API wallet)', async () => {
    const fallback = { id: 'baseAccount', explorerId: 'wc_wallet' }
    // apiWallet has no connectors, so the first (guarded) lookup is skipped — only the
    // fallback lookup by wallet id runs, and it resolves the Base Account connector.
    const getConnector = vi
      .spyOn(ConnectorController, 'getConnector')
      .mockReturnValue(fallback as never)
    const connectExternal = vi
      .spyOn(ConnectorControllerUtil, 'connectExternal')
      .mockResolvedValue(undefined as never)

    await HeadlessWalletUtil.connect(apiWallet, 'eip155')

    expect(getConnector).toHaveBeenCalledTimes(1)
    expect(getConnector).toHaveBeenCalledWith({ id: 'wc_wallet', namespace: 'eip155' })
    expect(connectExternal).toHaveBeenCalledWith(fallback)
  })

  it('deeplinks on mobile when the wallet declares a mobile link', async () => {
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined as never)
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(ConnectUtil, 'mapWalletItemToWcWallet').mockReturnValue({
      id: 'wc_wallet',
      name: 'Some Wallet',
      mobile_link: 'somewallet://'
    } as never)
    const onConnectMobile = vi
      .spyOn(ConnectionControllerUtil, 'onConnectMobile')
      .mockImplementation(vi.fn())

    await HeadlessWalletUtil.connect(apiWallet, 'eip155', { wcPayUrl: 'https://pay/x' })

    expect(onConnectMobile).toHaveBeenCalledWith(
      expect.objectContaining({ mobile_link: 'somewallet://' }),
      'https://pay/x'
    )
  })

  it('redirects via MobileWalletUtil on mobile when there is no mobile link', async () => {
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined as never)
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    vi.spyOn(ConnectUtil, 'mapWalletItemToWcWallet').mockReturnValue({
      id: 'wc_wallet',
      name: 'Some Wallet'
    } as never)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({ enableCoinbase: true } as never)
    const redirect = vi
      .spyOn(MobileWalletUtil, 'handleMobileDeeplinkRedirect')
      .mockImplementation(vi.fn())

    await HeadlessWalletUtil.connect(apiWallet, 'eip155')

    expect(redirect).toHaveBeenCalledWith('wc_wallet', 'eip155', { isCoinbaseDisabled: false })
  })

  it('falls back to WalletConnect on desktop', async () => {
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined as never)
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    const connectWc = vi
      .spyOn(ConnectionController, 'connectWalletConnect')
      .mockResolvedValue(undefined as never)

    await HeadlessWalletUtil.connect(apiWallet, 'eip155')

    expect(connectWc).toHaveBeenCalledWith({ cache: 'never' })
  })

  it('clears connectingWallet and rethrows on failure', async () => {
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue({ id: 'io.metamask' } as never)
    vi.spyOn(ConnectorControllerUtil, 'connectExternal').mockRejectedValue(new Error('boom'))

    await expect(HeadlessWalletUtil.connect(injectedWallet, 'eip155')).rejects.toThrow('boom')
    expect(PublicStateController.set).toHaveBeenLastCalledWith({ connectingWallet: undefined })
  })

  it('falls back to the active chain when no namespace is given', async () => {
    const getConnector = vi
      .spyOn(ConnectorController, 'getConnector')
      .mockReturnValue({ id: 'io.metamask' } as never)
    vi.spyOn(ConnectorControllerUtil, 'connectExternal').mockResolvedValue(undefined as never)

    await HeadlessWalletUtil.connect(injectedWallet)

    expect(getConnector).toHaveBeenCalledWith(
      expect.objectContaining({ namespace: 'eip155' as ChainNamespace })
    )
  })
})

describe('HeadlessWalletUtil.getWalletConnectUri', () => {
  it('resets then fetches the URI with auto cache', async () => {
    const resetUri = vi.spyOn(ConnectionController, 'resetUri').mockImplementation(vi.fn())
    const setWcLinking = vi.spyOn(ConnectionController, 'setWcLinking').mockImplementation(vi.fn())
    const connectWc = vi
      .spyOn(ConnectionController, 'connectWalletConnect')
      .mockResolvedValue(undefined as never)

    await HeadlessWalletUtil.getWalletConnectUri()

    expect(resetUri).toHaveBeenCalled()
    expect(setWcLinking).toHaveBeenCalledWith(undefined)
    expect(connectWc).toHaveBeenCalledWith({ cache: 'auto' })
  })
})

describe('HeadlessWalletUtil resets', () => {
  it('resetWcUri resets the URI + linking', () => {
    const resetUri = vi.spyOn(ConnectionController, 'resetUri').mockImplementation(vi.fn())
    const setWcLinking = vi.spyOn(ConnectionController, 'setWcLinking').mockImplementation(vi.fn())

    HeadlessWalletUtil.resetWcUri()

    expect(resetUri).toHaveBeenCalled()
    expect(setWcLinking).toHaveBeenCalledWith(undefined)
  })

  it('resetConnectingWallet clears the connecting wallet', () => {
    HeadlessWalletUtil.resetConnectingWallet()

    expect(PublicStateController.set).toHaveBeenCalledWith({ connectingWallet: undefined })
  })
})
