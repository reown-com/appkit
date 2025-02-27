import { fixture } from '@open-wc/testing'
import { describe, expect, test, vi } from 'vitest'

import { html } from 'lit'

import { ChainController, CoreHelperUtil, RouterController } from '@reown/appkit-core'
import type { WcWallet } from '@reown/appkit-core'
import type { WuiTabs } from '@reown/appkit-ui/wui-tabs'

import type { W3mConnectingWcView } from '../../exports'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //

const WALLET = {
  id: 'metamask',
  name: 'MetaMask'
} as WcWallet

describe('W3mConnectingWcView - Render', () => {
  test('should render walletConnect widget if no wallet is given', async () => {
    const element: W3mConnectingWcView = await fixture(
      html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`
    )

    expect(HelpersUtil.querySelect(element, 'w3m-connecting-wc-qrcode')).not.toBeNull()
  })

  test('should render web and browser platforms', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: {
          ...WALLET,
          rdns: 'metamask.io',
          webapp_link: 'https://metamask.io'
        }
      }
    })

    const element: W3mConnectingWcView = await fixture(
      html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`
    )

    const w3mConnectingHeader = HelpersUtil.querySelect(element, 'w3m-connecting-header')

    expect(w3mConnectingHeader).not.toBeNull()

    const wuiTabs = HelpersUtil.querySelect(w3mConnectingHeader, 'wui-tabs') as WuiTabs

    expect(wuiTabs).not.toBeNull()

    const tabsProperty = wuiTabs.tabs

    expect(tabsProperty).toStrictEqual([
      { label: 'Webapp', icon: 'browser', platform: 'web' },
      { label: 'Browser', icon: 'extension', platform: 'unsupported' }
    ])
  })

  test('should render mobile and browser platforms', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: {
          ...WALLET,
          webapp_link: 'https://metamask.io',
          mobile_link: 'https://metamask.io'
        }
      }
    })

    const element: W3mConnectingWcView = await fixture(
      html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`
    )

    const w3mConnectingHeader = HelpersUtil.querySelect(element, 'w3m-connecting-header')

    expect(w3mConnectingHeader).not.toBeNull()

    const wuiTabs = HelpersUtil.querySelect(w3mConnectingHeader, 'wui-tabs') as WuiTabs

    expect(wuiTabs).not.toBeNull()

    const tabsProperty = wuiTabs.tabs

    expect(tabsProperty).toStrictEqual([
      { label: 'Mobile', icon: 'mobile', platform: 'mobile' },
      { label: 'Webapp', icon: 'browser', platform: 'web' }
    ])
  })

  test('should not render browser platforms when noAdapters is true', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      noAdapters: true
    })

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: {
          ...WALLET,
          rdns: 'metamask.io',
          webapp_link: 'https://metamask.io',
          mobile_link: 'https://metamask.io'
        }
      }
    })

    const element: W3mConnectingWcView = await fixture(
      html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`
    )

    const w3mConnectingHeader = HelpersUtil.querySelect(element, 'w3m-connecting-header')
    expect(w3mConnectingHeader).not.toBeNull()

    const wuiTabs = HelpersUtil.querySelect(w3mConnectingHeader, 'wui-tabs') as WuiTabs
    expect(wuiTabs).not.toBeNull()

    const tabsProperty = wuiTabs.tabs
    expect(tabsProperty).toStrictEqual([
      { label: 'Mobile', icon: 'mobile', platform: 'qrcode' },
      { label: 'Webapp', icon: 'browser', platform: 'web' }
    ])
  })
})
