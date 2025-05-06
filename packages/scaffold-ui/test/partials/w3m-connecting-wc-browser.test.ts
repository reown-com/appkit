import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ConnectionController,
  type Connector,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  type WcWallet
} from '@reown/appkit-controllers'

const WALLET = {
  name: 'MetaMask',
  rdns: 'metamask.io'
} as WcWallet

const CONNECTOR = {
  type: 'ANNOUNCED',
  name: 'MetaMask',
  chain: 'eip155',
  info: { rdns: 'metamask.io' }
} as Connector

describe('W3mConnectingWcBrowser', () => {
  beforeAll(() => {
    Element.prototype.animate = vi.fn()
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('it should send SELECT_WALLET event when constructor is called', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: WALLET
      }
    })

    vi.spyOn(EventsController, 'sendEvent')

    await fixture(html`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`)

    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: WALLET.name, platform: 'browser' }
    })
  })

  it('it should connect successfully if a connector exist', async () => {
    vi.spyOn(ConnectionController, 'connectExternal')
    vi.spyOn(EventsController, 'sendEvent')
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [CONNECTOR]
    })

    await fixture(html`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`)

    expect(ConnectionController.connectExternal).toHaveBeenCalledWith(CONNECTOR, CONNECTOR.chain)
    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'CONNECT_SUCCESS',
      properties: { method: 'browser', name: CONNECTOR.name }
    })
  })

  it('it should throw an error if trying to connect when a connector does not exist', async () => {
    vi.spyOn(EventsController, 'sendEvent')
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: [] // No connectors
    })

    await fixture(html`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`)

    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'CONNECT_ERROR',
      properties: { message: 'w3m-connecting-wc-browser: No connector found' }
    })
  })
})
