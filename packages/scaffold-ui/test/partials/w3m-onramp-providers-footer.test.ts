import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { CaipNetwork } from '@reown/appkit-common'
import {
  ChainController,
  type ChainControllerState,
  EventsController,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { W3mOnRampProvidersFooter } from '../../src/partials/w3m-onramp-providers-footer'

describe('W3mOnRampProvidersFooter', () => {
  beforeEach(() => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      termsConditionsUrl: 'https://terms.com',
      privacyPolicyUrl: 'https://privacy.com'
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render null when no terms or privacy URLs are provided', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      termsConditionsUrl: '',
      privacyPolicyUrl: ''
    })

    const element: W3mOnRampProvidersFooter = await fixture(
      html`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`
    )

    await elementUpdated(element)
    expect(element.shadowRoot?.querySelector('wui-flex')).toBeNull()
  })

  it('should render footer content when URLs are provided', async () => {
    const element: W3mOnRampProvidersFooter = await fixture(
      html`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const text = element.shadowRoot?.querySelector('wui-text[color="fg-250"]')
    const textContent = text?.textContent?.replace(/\s+/g, ' ').trim()
    expect(textContent).toBe(
      'We work with the best providers to give you the lowest fees and best support. More options coming soon!'
    )
  })

  it('should render "How does it work?" link', async () => {
    const element: W3mOnRampProvidersFooter = await fixture(
      html`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const link = element.shadowRoot?.querySelector('wui-link')
    expect(link).not.toBeNull()
    expect(link?.textContent?.trim()).toBe('How does it work?')

    const icon = link?.querySelector('wui-icon[name="helpCircle"]')
    expect(icon).not.toBeNull()
  })

  it('should handle "How does it work?" click event', async () => {
    const eventsControllerSpy = vi.spyOn(EventsController, 'sendEvent')
    const routerControllerSpy = vi.spyOn(RouterController, 'push')
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      chains: new Map([
        [
          'eip155',
          {
            accountState: {
              preferredAccountType: W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
            }
          }
        ]
      ]),
      activeChain: 'eip155',
      activeCaipNetwork: {
        chainNamespace: 'eip155',
        chainId: '1'
      } as unknown as CaipNetwork
    } as ChainControllerState)

    const element: W3mOnRampProvidersFooter = await fixture(
      html`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const link = element.shadowRoot?.querySelector('wui-link')
    link?.click()

    expect(eventsControllerSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_WHAT_IS_A_BUY',
      properties: {
        isSmartAccount: true
      }
    })
    expect(routerControllerSpy).toHaveBeenCalledWith('WhatIsABuy')
  })

  it('should handle "How does it work?" click event with non-smart account', async () => {
    const eventsControllerSpy = vi.spyOn(EventsController, 'sendEvent')
    const routerControllerSpy = vi.spyOn(RouterController, 'push')

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      chains: new Map([
        [
          'eip155',
          {
            accountState: {
              preferredAccountType: W3mFrameRpcConstants.ACCOUNT_TYPES.EOA
            }
          }
        ]
      ]),
      activeChain: 'eip155',
      activeCaipNetwork: {
        chainNamespace: 'eip155',
        chainId: '1'
      } as unknown as CaipNetwork
    } as ChainControllerState)

    const element: W3mOnRampProvidersFooter = await fixture(
      html`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const link = element.shadowRoot?.querySelector('wui-link')
    link?.click()

    expect(eventsControllerSpy).toHaveBeenCalledWith({
      type: 'track',
      event: 'SELECT_WHAT_IS_A_BUY',
      properties: {
        isSmartAccount: false
      }
    })
    expect(routerControllerSpy).toHaveBeenCalledWith('WhatIsABuy')
  })
})
