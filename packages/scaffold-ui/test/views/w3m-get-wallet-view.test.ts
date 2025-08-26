import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ApiController,
  AssetUtil,
  CoreHelperUtil,
  OptionsController
} from '@reown/appkit-controllers'

import { W3mGetWalletView } from '../../src/views/w3m-get-wallet-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const FLEX_CONTAINER_SELECTOR = 'wui-flex'
const LIST_WALLET_SELECTOR = 'wui-list-wallet'
const MOCK_WALLETS = [
  { id: 'wallet1', name: 'Wallet 1', homepage: 'https://wallet1.com' },
  { id: 'wallet2', name: 'Wallet 2', homepage: 'https://wallet2.com' },
  { id: 'wallet3', name: 'Wallet 3', homepage: 'https://wallet3.com' },
  { id: 'wallet4', name: 'Wallet 4', homepage: 'https://wallet4.com' },
  { id: 'wallet5', name: 'Wallet 5', homepage: 'https://wallet5.com' }
]

describe('W3mGetWalletView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [MOCK_WALLETS[0], MOCK_WALLETS[1]] as any,
      recommended: [MOCK_WALLETS[2], MOCK_WALLETS[3]] as any
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: []
    })
    vi.spyOn(AssetUtil, 'getWalletImage').mockReturnValue('wallet-image.png')
    vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(vi.fn())
  })

  it('should render', async () => {
    const element: W3mGetWalletView = await fixture(
      html`<w3m-get-wallet-view></w3m-get-wallet-view>`
    )
    expect(element).toBeTruthy()
  })

  it('should render container and wallet list', async () => {
    const element: W3mGetWalletView = await fixture(
      html`<w3m-get-wallet-view></w3m-get-wallet-view>`
    )

    const container = HelpersUtil.querySelect(element, FLEX_CONTAINER_SELECTOR)
    const walletItems = HelpersUtil.querySelectAll(element, LIST_WALLET_SELECTOR)

    expect(container).toBeTruthy()
    expect(walletItems).toHaveLength(5)
  })

  it('should render recommended wallets from featured, custom, and recommended', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: [MOCK_WALLETS[4]] as any
    })

    const element: W3mGetWalletView = await fixture(
      html`<w3m-get-wallet-view></w3m-get-wallet-view>`
    )

    const walletItems = HelpersUtil.querySelectAll(element, LIST_WALLET_SELECTOR)
    expect(walletItems).toHaveLength(5)

    const walletNames = Array.from(walletItems)
      .slice(0, 4)
      .map(item => item.getAttribute('name'))
    expect(walletNames).toEqual(['Wallet 1', 'Wallet 2', 'Wallet 5', 'Wallet 3'])
  })

  it('should render explore all wallet item', async () => {
    const element: W3mGetWalletView = await fixture(
      html`<w3m-get-wallet-view></w3m-get-wallet-view>`
    )

    const walletItems = HelpersUtil.querySelectAll(element, LIST_WALLET_SELECTOR)
    const exploreAllItem = walletItems[walletItems.length - 1]

    expect(exploreAllItem?.getAttribute('name')).toBe('Explore all')
    expect(exploreAllItem?.hasAttribute('showAllWallets')).toBe(true)
    expect(exploreAllItem?.getAttribute('walletIcon')).toBe('allWallets')
    expect(exploreAllItem?.getAttribute('icon')).toBe('externalLink')
  })

  it('should open wallet homepage when wallet is clicked', async () => {
    const element: W3mGetWalletView = await fixture(
      html`<w3m-get-wallet-view></w3m-get-wallet-view>`
    )

    const walletItems = HelpersUtil.querySelectAll(element, LIST_WALLET_SELECTOR)
    const firstWallet = walletItems[0]

    await firstWallet?.click()

    expect(CoreHelperUtil.openHref).toHaveBeenCalledWith('https://wallet1.com', '_blank')
  })

  it('should open explorer when explore all is clicked', async () => {
    const element: W3mGetWalletView = await fixture(
      html`<w3m-get-wallet-view></w3m-get-wallet-view>`
    )

    const walletItems = HelpersUtil.querySelectAll(element, LIST_WALLET_SELECTOR)
    const exploreAllItem = walletItems[walletItems.length - 1]

    await exploreAllItem?.click()

    expect(CoreHelperUtil.openHref).toHaveBeenCalledWith(
      'https://walletconnect.com/explorer?type=wallet',
      '_blank'
    )
  })

  it('should open explorer when wallet has no homepage', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [{ id: 'wallet1', name: 'Wallet 1', homepage: undefined }],
      recommended: []
    })

    const element: W3mGetWalletView = await fixture(
      html`<w3m-get-wallet-view></w3m-get-wallet-view>`
    )

    const walletItems = HelpersUtil.querySelectAll(element, LIST_WALLET_SELECTOR)
    const firstWallet = walletItems[0]

    await firstWallet?.click()

    expect(CoreHelperUtil.openHref).toHaveBeenCalledWith(
      'https://walletconnect.com/explorer',
      '_blank'
    )
  })

  it('should handle empty wallet lists', async () => {
    vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
      ...ApiController.state,
      featured: [],
      recommended: []
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      customWallets: []
    })

    const element: W3mGetWalletView = await fixture(
      html`<w3m-get-wallet-view></w3m-get-wallet-view>`
    )

    const walletItems = HelpersUtil.querySelectAll(element, LIST_WALLET_SELECTOR)
    expect(walletItems).toHaveLength(1)
  })
})
