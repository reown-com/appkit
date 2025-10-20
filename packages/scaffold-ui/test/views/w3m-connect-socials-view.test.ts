import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { OptionsController, OptionsStateController } from '@reown/appkit-controllers'

import { W3mConnectSocialsView } from '../../src/views/w3m-connect-socials-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const LEGAL_CHECKBOX_SELECTOR = 'w3m-legal-checkbox'
const SOCIAL_LOGIN_LIST_SELECTOR = 'w3m-social-login-list'
const FLEX_CONTAINER_SELECTOR = 'wui-flex'

describe('W3mConnectSocialsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: { legalCheckbox: true },
      termsConditionsUrl: '',
      privacyPolicyUrl: 'https://privacy'
    })
    vi.spyOn(OptionsStateController, 'state', 'get').mockReturnValue({
      ...OptionsStateController.state,
      isLegalCheckboxChecked: false
    })
    vi.spyOn(OptionsStateController, 'subscribeKey').mockImplementation(() => () => {})
  })

  it('should render', async () => {
    const element: W3mConnectSocialsView = await fixture(
      html`<w3m-connect-socials-view></w3m-connect-socials-view>`
    )
    expect(element).toBeTruthy()
  })

  it('should render legal checkbox and social login list', async () => {
    const element: W3mConnectSocialsView = await fixture(
      html`<w3m-connect-socials-view></w3m-connect-socials-view>`
    )

    const legalCheckbox = HelpersUtil.querySelect(element, LEGAL_CHECKBOX_SELECTOR)
    const socialList = HelpersUtil.querySelect(element, SOCIAL_LOGIN_LIST_SELECTOR)

    expect(legalCheckbox).toBeTruthy()
    expect(socialList).toBeTruthy()
  })

  it('should disable social list when legal checkbox unchecked', async () => {
    const element: W3mConnectSocialsView = await fixture(
      html`<w3m-connect-socials-view></w3m-connect-socials-view>`
    )

    const container = HelpersUtil.querySelect(element, FLEX_CONTAINER_SELECTOR) as HTMLElement

    expect(container.classList.contains('disabled')).toBe(true)
  })

  it('should enable social list when legal checkbox checked', async () => {
    vi.spyOn(OptionsStateController, 'state', 'get').mockReturnValue({
      ...OptionsStateController.state,
      isLegalCheckboxChecked: true
    })

    const element: W3mConnectSocialsView = await fixture(
      html`<w3m-connect-socials-view></w3m-connect-socials-view>`
    )

    const container = HelpersUtil.querySelect(element, FLEX_CONTAINER_SELECTOR) as HTMLElement

    expect(container.classList.contains('disabled')).toBe(false)
  })

  it('should enable social list when legalCheckbox feature is disabled', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: { legalCheckbox: false },
      termsConditionsUrl: '',
      privacyPolicyUrl: 'https://privacy'
    })

    const element: W3mConnectSocialsView = await fixture(
      html`<w3m-connect-socials-view></w3m-connect-socials-view>`
    )

    const container = HelpersUtil.querySelect(element, FLEX_CONTAINER_SELECTOR) as HTMLElement

    expect(container.classList.contains('disabled')).toBe(false)
  })

  it('should disable social list when privacy policy URL is provided and legal checkbox is checked', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: { legalCheckbox: true },
      termsConditionsUrl: '',
      privacyPolicyUrl: 'https://privacy'
    })

    const element: W3mConnectSocialsView = await fixture(
      html`<w3m-connect-socials-view></w3m-connect-socials-view>`
    )

    const container = HelpersUtil.querySelect(element, FLEX_CONTAINER_SELECTOR) as HTMLElement

    expect(container.classList.contains('disabled')).toBe(true)
  })

  it('should subscribe to OptionsStateController state changes', async () => {
    const subscribeSpy = vi
      .spyOn(OptionsStateController, 'subscribeKey')
      .mockImplementation(() => () => {})

    await fixture(html`<w3m-connect-socials-view></w3m-connect-socials-view>`)

    expect(subscribeSpy).toHaveBeenCalledWith('isLegalCheckboxChecked', expect.any(Function))
  })

  it('should unsubscribe on disconnect', async () => {
    const unsubscribeMock = vi.fn()
    vi.spyOn(OptionsStateController, 'subscribeKey').mockImplementation(() => unsubscribeMock)

    const element: W3mConnectSocialsView = await fixture(
      html`<w3m-connect-socials-view></w3m-connect-socials-view>`
    )

    element.disconnectedCallback()

    expect(unsubscribeMock).toHaveBeenCalled()
  })
})
