import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  AssetUtil,
  type Connector,
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import { W3mConnectingMultiChainView } from '../../src/views/w3m-connecting-multi-chain-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const FLEX_CONTAINER_SELECTOR = 'wui-flex'

const getListChainSelector = (chain: string) => `wui-list-chain-${chain}`

const MOCK_ACTIVE_CONNECTOR = {
  id: 'multiWallet',
  name: 'Multi Wallet',
  connectors: [
    { id: 'walletConnect', name: 'EVM', chain: 'eip155' },
    { id: 'external', name: 'Solana', chain: 'solana' }
  ]
}

describe('W3mConnectingMultiChainView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      activeConnector: MOCK_ACTIVE_CONNECTOR as Connector
    })
    vi.spyOn(ConnectorController, 'subscribeKey').mockImplementation(
      vi.fn().mockReturnValue(vi.fn())
    )
    vi.spyOn(AssetUtil, 'getConnectorImage').mockReturnValue('connector.png')
    vi.spyOn(AssetUtil, 'getChainImage').mockReturnValue('chain.png')
  })

  it('should render', async () => {
    const element: W3mConnectingMultiChainView = await fixture(
      html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`
    )
    expect(element).toBeTruthy()

    const container = HelpersUtil.querySelect(element, FLEX_CONTAINER_SELECTOR)
    expect(container).toBeTruthy()
  })

  it('should render chain items for each available connector', async () => {
    const element: W3mConnectingMultiChainView = await fixture(
      html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`
    )

    const evmItem = HelpersUtil.getByTestId(element, getListChainSelector('eip155'))
    const solItem = HelpersUtil.getByTestId(element, getListChainSelector('solana'))

    expect(evmItem).toBeTruthy()
    expect(solItem).toBeTruthy()
  })

  it('should navigate to AllWallets on mobile when walletConnect connector clicked', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)
    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(vi.fn())

    const element: W3mConnectingMultiChainView = await fixture(
      html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`
    )

    const evmItem = HelpersUtil.getByTestId(element, getListChainSelector('eip155'))
    await evmItem.click()

    expect(pushSpy).toHaveBeenCalledWith('AllWallets')
  })

  it('should navigate to ConnectingWalletConnect on desktop for walletConnect', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(vi.fn())

    const element: W3mConnectingMultiChainView = await fixture(
      html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`
    )

    const evmItem = HelpersUtil.getByTestId(element, getListChainSelector('eip155'))
    await evmItem.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingWalletConnect')
  })

  it('should navigate to ConnectingExternal for non-walletConnect connector', async () => {
    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(vi.fn())

    const element: W3mConnectingMultiChainView = await fixture(
      html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`
    )

    const solItem = HelpersUtil.getByTestId(element, getListChainSelector('solana'))
    await solItem.click()

    expect(pushSpy).toHaveBeenCalledWith('ConnectingExternal', {
      connector: expect.objectContaining({ chain: 'solana' })
    })
  })

  it('should show error when matching connector is not found', async () => {
    const errorSpy = vi.spyOn(SnackController, 'showError').mockImplementation(vi.fn())

    const element: W3mConnectingMultiChainView = await fixture(
      html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`
    )

    ;(element as any)['activeConnector'] = { id: 'x', name: 'x', connectors: [] }
    await element.updateComplete
    ;(element as any)['onConnector']({ id: 'missing', name: 'EVM', chain: 'eip155' })

    expect(errorSpy).toHaveBeenCalledWith('Failed to find connector')
  })

  it('should subscribe to ConnectorController state changes and unsubscribe on disconnect', async () => {
    const mockUnsubscribe = vi.fn()
    const subscribeSpy = vi
      .spyOn(ConnectorController, 'subscribeKey')
      .mockImplementation(vi.fn().mockReturnValue(mockUnsubscribe))

    const element: W3mConnectingMultiChainView = await fixture(
      html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`
    )

    expect(subscribeSpy).toHaveBeenCalledWith('activeConnector', expect.any(Function))

    element.disconnectedCallback()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should render connector image and title text', async () => {
    const element: W3mConnectingMultiChainView = await fixture(
      html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`
    )

    const title = HelpersUtil.querySelect(element, 'wui-text')
    expect(title?.textContent).toContain(`Select Chain for ${MOCK_ACTIVE_CONNECTOR.name}`)

    const walletImage = HelpersUtil.querySelect(element, 'wui-wallet-image')
    expect(walletImage).toBeTruthy()
  })
})
