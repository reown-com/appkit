import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ConnectionController,
  CoreHelperUtil,
  EventsController,
  OptionsController,
  RouterController,
  type WcWallet
} from '@reown/appkit-core'
import type { WuiQrCode } from '@reown/appkit-ui'

import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants ------------------------------------------- //
const ALL_WALLETS_WIDGET = 'w3m-all-wallets-widget'
const QR_CODE = 'wui-qr-code'
const WALLET = {
  name: 'WalletConnect'
} as WcWallet

describe('W3mConnectingWcQrcode', () => {
  beforeAll(() => {
    vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
      ...ConnectionController.state,
      wcUri: 'xyz'
    })
    vi.spyOn(EventsController, 'sendEvent')
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('it should display a QR code', async () => {
    vi.spyOn(ConnectionController, 'setWcLinking')
    vi.spyOn(ConnectionController, 'setRecentWallet')
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: WALLET
      }
    })

    const connectingQrCode = await fixture(
      html`<w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode>`
    )

    await new Promise(resolve => setTimeout(resolve, 300))

    const qrCode = HelpersUtil.querySelect(connectingQrCode, QR_CODE) as WuiQrCode

    expect(qrCode).not.toBeNull()
    expect(qrCode.getAttribute('uri')).toBe('xyz')
    expect(ConnectionController.setWcLinking).toHaveBeenCalledWith(undefined)
    expect(ConnectionController.setRecentWallet).toHaveBeenCalledWith(WALLET)
    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: WALLET.name, platform: 'qrcode' }
    })
  })

  it('it should use the injected universal provider when "OptionsController.useInjectedUniversalProvider" is true', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      useInjectedUniversalProvider: true
    })

    const connectingQrCode = await fixture(
      html`<w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode>`
    )

    // We display all wallets widget if we use injected universal provider
    expect(HelpersUtil.querySelect(connectingQrCode, ALL_WALLETS_WIDGET)).not.toBeNull()
    expect(EventsController.sendEvent).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: WALLET.name, platform: 'qrcode' }
    })
  })
})
