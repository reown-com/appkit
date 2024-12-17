import { describe, it, expect, vi, beforeEach, test, beforeAll } from 'vitest'
import { CoreHelperUtil, RouterController } from '@reown/appkit-core'
import type { W3mConnectingWcView } from '../../exports'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import type { WcWallet } from '@reown/appkit-core'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //

const WALLET = {
  id: 'metamask',
  name: 'MetaMask'
} as WcWallet

describe('W3mConnectingWcView - Render', () => {
  beforeAll(() => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
  })

  test.skip('should render walletConnect widget if no wallet is give', async () => {
    const element: W3mConnectingWcView = await fixture(
      html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`
    )

    expect(HelpersUtil.querySelect(element, 'w3m-connecting-wc-qrcode')).not.toBeNull()
  })

  test('should render browser widget if rdns or injected ids are present', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: {
          ...WALLET,
          rdns: 'metamask.io',
          injected: [{ injected_id: 'isMetamask' }],
          webapp_link: 'https://metamask.io'
        }
      }
    })

    const element: W3mConnectingWcView = await fixture(
      html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`
    )

    const w3mConnectingHeader = HelpersUtil.querySelect(element, 'w3m-connecting-header')
    expect(w3mConnectingHeader).not.toBeNull()
  })
})
