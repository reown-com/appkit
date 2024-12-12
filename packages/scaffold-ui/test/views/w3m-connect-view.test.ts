import { W3mConnectView } from '../../src/views/w3m-connect-view/index'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fixture } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import { OptionsController } from '@reown/appkit-core'

// --- Constants ---------------------------------------------------- //
const EMAIL_LOGIN_WIDGET = 'w3m-email-login-widget'
const SOCIAL_LOGIN_WIDGET = 'w3m-social-login-widget'
const WALLET_LOGIN_LIST = 'w3m-wallet-login-list'
const COLLAPSE_WALLETS_BUTTON = 'w3m-collapse-wallets-button'
const SEPARATOR = 'wui-separator'
const EMAIL_SEPARATOR = 'w3m-email-login-or-separator'

describe('W3mConnectView - Connection Methods', () => {
  beforeEach(() => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      enableWallets: true,
      features: {
        email: true,
        socials: ['google', 'facebook'],
        connectMethodsOrder: ['wallet', 'email', 'social'],
        collapseWallets: false
      }
    })
  })

  it('should render connection methods in specified order', async () => {
    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    const children = Array.from(
      element.shadowRoot?.querySelector('.connect-methods')?.children ?? []
    )
    const widgets = children.map(child => child.tagName.toLowerCase())

    expect(widgets).toContain(WALLET_LOGIN_LIST)
    expect(widgets).toContain(EMAIL_LOGIN_WIDGET)
    expect(widgets).toContain(SOCIAL_LOGIN_WIDGET)

    // Check order
    expect(widgets.indexOf(WALLET_LOGIN_LIST)).toBeLessThan(widgets.indexOf(EMAIL_LOGIN_WIDGET))
    expect(widgets.indexOf(EMAIL_LOGIN_WIDGET)).toBeLessThan(widgets.indexOf(SOCIAL_LOGIN_WIDGET))
  })

  it('should render "Continue with wallet" button when collapseWallets is true', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      enableWallets: true,
      features: {
        email: true,
        socials: ['google'],
        connectMethodsOrder: ['wallet', 'email', 'social'],
        collapseWallets: true
      }
    })

    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    const collapseButton = HelpersUtil.getByTestId(element, COLLAPSE_WALLETS_BUTTON)
    expect(collapseButton).not.toBeNull()
    expect(HelpersUtil.querySelect(element, WALLET_LOGIN_LIST)).toBeNull()
  })

  it('should render one separator between wallet and email/social group', async () => {
    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    const separators = Array.from(element.shadowRoot?.querySelectorAll(SEPARATOR) ?? [])
    expect(separators.length).toBe(1)
  })

  it('should render one separator between wallet and social/email group', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        email: true,
        socials: ['google'],
        connectMethodsOrder: ['social', 'email', 'wallet']
      }
    })

    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    const separators = Array.from(element.shadowRoot?.querySelectorAll(SEPARATOR) ?? [])
    expect(separators.length).toBe(1)
  })

  it('should render two separators between each method', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        email: true,
        socials: ['google'],
        connectMethodsOrder: ['email', 'wallet', 'social']
      }
    })
    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    const separators = Array.from(element.shadowRoot?.querySelectorAll(SEPARATOR) ?? [])
    expect(separators.length).toBe(2)
  })

  it('should not render email widget when email is disabled', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        email: false,
        socials: ['google'],
        connectMethodsOrder: ['wallet', 'email', 'social']
      }
    })

    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    expect(HelpersUtil.querySelect(element, EMAIL_LOGIN_WIDGET)).toBeNull()
    expect(HelpersUtil.querySelect(element, EMAIL_SEPARATOR)).toBeNull()
  })

  it('should not render social widget when socials are empty', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        email: true,
        socials: [],
        connectMethodsOrder: ['wallet', 'email', 'social']
      }
    })

    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    expect(HelpersUtil.querySelect(element, SOCIAL_LOGIN_WIDGET)).toBeNull()
  })

  it('should not render wallet list when enableWallets is false', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      enableWallets: false,
      features: {
        email: true,
        socials: ['google'],
        connectMethodsOrder: ['wallet', 'email', 'social']
      }
    })

    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    expect(HelpersUtil.querySelect(element, WALLET_LOGIN_LIST)).toBeNull()
    expect(HelpersUtil.querySelect(element, COLLAPSE_WALLETS_BUTTON)).toBeNull()
  })

  it('should handle custom connection method order', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        email: true,
        socials: ['google'],
        connectMethodsOrder: ['social', 'email', 'wallet']
      }
    })

    const element: W3mConnectView = await fixture(html`<w3m-connect-view></w3m-connect-view>`)

    const children = Array.from(
      element.shadowRoot?.querySelector('.connect-methods')?.children ?? []
    )
    const widgets = children.map(child => child.tagName.toLowerCase())

    expect(widgets.indexOf(SOCIAL_LOGIN_WIDGET)).toBeLessThan(widgets.indexOf(EMAIL_LOGIN_WIDGET))
    expect(widgets.indexOf(EMAIL_LOGIN_WIDGET)).toBeLessThan(widgets.indexOf(WALLET_LOGIN_LIST))
  })
})

describe('W3mConnectView - Explore Mode', () => {
  it('should not render separators in explore mode if wallet guide is enabled', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      enableWalletGuide: true
    })

    const element: W3mConnectView = await fixture(
      html`<w3m-connect-view .walletGuide=${'explore'}></w3m-connect-view>`
    )

    const separators = element.shadowRoot?.querySelectorAll(SEPARATOR)
    expect(separators?.length).toBe(1) // Only the explore separator should be present
    expect(HelpersUtil.querySelect(element, '#explore')).not.toBeNull()
  })

  it('should not render wallet list in explore mode', async () => {
    const element: W3mConnectView = await fixture(
      html`<w3m-connect-view .walletGuide=${'explore'}></w3m-connect-view>`
    )

    expect(HelpersUtil.querySelect(element, WALLET_LOGIN_LIST)).toBeNull()
  })
})

describe('W3mConnectView - Wallet Guide Mode', () => {
  it('should render wallet guide if enableWalletGuide is true', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        email: true,
        socials: ['google']
      },
      enableWalletGuide: true
    })

    const element: W3mConnectView = await fixture(
      html`<w3m-connect-view .walletGuide=${'get-started'}></w3m-connect-view>`
    )
    expect(HelpersUtil.querySelect(element, 'w3m-wallet-guide')).not.toBeNull()
  })

  it('should not render wallet guide if enableWalletGuide is false', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        email: true,
        socials: ['google']
      },
      enableWalletGuide: false
    })

    const element: W3mConnectView = await fixture(
      html`<w3m-connect-view .walletGuide=${'get-started'}></w3m-connect-view>`
    )

    expect(HelpersUtil.querySelect(element, 'w3m-wallet-guide')).toBeNull()
  })
})
