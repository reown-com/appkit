import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { OptionsController, OptionsStateController } from '@reown/appkit-controllers'

import { W3mConnectWalletsView } from '../../src/views/w3m-connect-wallets-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const LEGAL_CHECKBOX_SELECTOR = 'w3m-legal-checkbox'
const WALLET_LOGIN_LIST_SELECTOR = 'w3m-wallet-login-list'
const FLEX_CONTAINER_SELECTOR = 'wui-flex'

describe('W3mConnectWalletsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: { legalCheckbox: true },
      termsConditionsUrl: 'https://terms',
      privacyPolicyUrl: ''
    })
    vi.spyOn(OptionsStateController, 'state', 'get').mockReturnValue({
      ...OptionsStateController.state,
      isLegalCheckboxChecked: false
    })
    vi.spyOn(OptionsStateController, 'subscribeKey').mockImplementation(
      vi.fn().mockReturnValue(vi.fn())
    )
  })

  it('should render', async () => {
    const element: W3mConnectWalletsView = await fixture(
      html`<w3m-connect-wallets-view></w3m-connect-wallets-view>`
    )
    expect(element).toBeTruthy()
  })

  it('should render legal checkbox and wallet login list', async () => {
    const element: W3mConnectWalletsView = await fixture(
      html`<w3m-connect-wallets-view></w3m-connect-wallets-view>`
    )

    const legalCheckbox = HelpersUtil.querySelect(element, LEGAL_CHECKBOX_SELECTOR)
    const walletList = HelpersUtil.querySelect(element, WALLET_LOGIN_LIST_SELECTOR)

    expect(legalCheckbox).toBeTruthy()
    expect(walletList).toBeTruthy()
  })

  it('should disable wallet list when legal checkbox unchecked', async () => {
    const element: W3mConnectWalletsView = await fixture(
      html`<w3m-connect-wallets-view></w3m-connect-wallets-view>`
    )

    const container = HelpersUtil.querySelect(element, FLEX_CONTAINER_SELECTOR) as HTMLElement

    expect(container.classList.contains('disabled')).toBe(true)
  })

  it('should enable wallet list when legal checkbox checked', async () => {
    vi.spyOn(OptionsStateController, 'state', 'get').mockReturnValue({
      ...OptionsStateController.state,
      isLegalCheckboxChecked: true
    })

    const element: W3mConnectWalletsView = await fixture(
      html`<w3m-connect-wallets-view></w3m-connect-wallets-view>`
    )

    const container = HelpersUtil.querySelect(element, FLEX_CONTAINER_SELECTOR) as HTMLElement

    expect(container.classList.contains('disabled')).toBe(false)
  })

  it('should subscribe to OptionsStateController state changes', async () => {
    const subscribeSpy = vi
      .spyOn(OptionsStateController, 'subscribeKey')
      .mockImplementation(vi.fn().mockReturnValue(vi.fn()))

    await fixture(html`<w3m-connect-wallets-view></w3m-connect-wallets-view>`)

    expect(subscribeSpy).toHaveBeenCalledWith('isLegalCheckboxChecked', expect.any(Function))
  })

  it('should unsubscribe on disconnect', async () => {
    const unsubscribeMock = vi.fn()
    vi.spyOn(OptionsStateController, 'subscribeKey').mockImplementation(
      vi.fn().mockReturnValue(unsubscribeMock)
    )

    const element: W3mConnectWalletsView = await fixture(
      html`<w3m-connect-wallets-view></w3m-connect-wallets-view>`
    )

    element.disconnectedCallback()

    expect(unsubscribeMock).toHaveBeenCalled()
  })
})
