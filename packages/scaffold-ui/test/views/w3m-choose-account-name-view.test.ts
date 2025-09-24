import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { NavigationUtil } from '@reown/appkit-common'
import {
  ChainController,
  CoreHelperUtil,
  EventsController,
  RouterController
} from '@reown/appkit-controllers'

import { W3mChooseAccountNameView } from '../../src/views/w3m-choose-account-name-view/index'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const CHOOSE_NAME_BUTTON_SELECTOR = 'wui-button'
const LEARN_MORE_LINK_SELECTOR = 'wui-link'
const ICON_BOX_SELECTOR = 'wui-icon-box'

describe('W3mChooseAccountNameView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
  })

  it('should render', async () => {
    const element: W3mChooseAccountNameView = await fixture(
      html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`
    )
    expect(element).toBeTruthy()
  })

  it('should render onboarding content', async () => {
    const element: W3mChooseAccountNameView = await fixture(
      html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`
    )

    const iconBox = HelpersUtil.querySelect(element, ICON_BOX_SELECTOR)
    const textElements = element.shadowRoot?.querySelectorAll('wui-text')
    const titleText = Array.from(textElements || []).find(el =>
      el.textContent?.includes('Choose your account name')
    )
    const descriptionText = Array.from(textElements || []).find(el =>
      el.textContent?.includes('Finally say goodbye to 0x addresses')
    )

    expect(iconBox).toBeTruthy()
    expect(titleText).toBeTruthy()
    expect(descriptionText).toBeTruthy()
  })

  it('should render choose name button', async () => {
    const element: W3mChooseAccountNameView = await fixture(
      html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`
    )

    const button = HelpersUtil.querySelect(element, CHOOSE_NAME_BUTTON_SELECTOR)
    expect(button).toBeTruthy()
    expect(button?.textContent?.trim()).toBe('Choose name')
  })

  it('should render learn more link', async () => {
    const element: W3mChooseAccountNameView = await fixture(
      html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`
    )

    const link = HelpersUtil.querySelect(element, LEARN_MORE_LINK_SELECTOR)
    expect(link).toBeTruthy()
    expect(link?.textContent?.trim()).toContain('Learn more about names')
  })

  it('should navigate to RegisterAccountName when choose name button is clicked', async () => {
    const pushSpy = vi.spyOn(RouterController, 'push').mockImplementation(vi.fn())
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(vi.fn())
    const element: W3mChooseAccountNameView = await fixture(
      html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`
    )
    const button = HelpersUtil.querySelect(element, CHOOSE_NAME_BUTTON_SELECTOR)
    button?.click()

    expect(pushSpy).toHaveBeenCalledWith('RegisterAccountName')
    expect(sendEventSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'OPEN_ENS_FLOW',
      properties: {
        isSmartAccount: false
      }
    })
  })

  it('should open FAQ link when learn more is clicked', async () => {
    const openHrefSpy = vi.spyOn(CoreHelperUtil, 'openHref').mockImplementation(vi.fn())

    const element: W3mChooseAccountNameView = await fixture(
      html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`
    )

    const link = HelpersUtil.querySelect(element, LEARN_MORE_LINK_SELECTOR)
    link?.click()

    expect(openHrefSpy).toHaveBeenCalledWith(NavigationUtil.URLS.FAQ, '_blank')
  })

  it('should show loading state on button when loading is true', async () => {
    const element: W3mChooseAccountNameView = await fixture(
      html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`
    )

    element['loading'] = true
    await element.updateComplete

    const button = HelpersUtil.querySelect(element, CHOOSE_NAME_BUTTON_SELECTOR)
    expect((button as any)?.loading).toBe(true)
  })

  it('should not show loading state on button when loading is false', async () => {
    const element: W3mChooseAccountNameView = await fixture(
      html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`
    )

    element['loading'] = false
    await element.updateComplete

    const button = HelpersUtil.querySelect(element, CHOOSE_NAME_BUTTON_SELECTOR)
    expect((button as any)?.loading).toBe(false)
  })
})
