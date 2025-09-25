import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { EventsController, RouterController } from '@reown/appkit-controllers'

import '../../src/modal/w3m-footer'
import { HelpersUtil } from '../../src/utils/HelpersUtil'

describe('W3mFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
  })

  it('should not render footer when hasFooter is false', async () => {
    vi.spyOn(HelpersUtil, 'hasFooter').mockReturnValue(false)
    RouterController.state.view = 'Connect'

    const el = await fixture(html`<w3m-footer></w3m-footer>`)
    await elementUpdated(el)

    const container = el.shadowRoot?.querySelector('div.container')
    expect(container).toBeTruthy()
    expect(container?.getAttribute('status')).toBe('hide')
    expect(el.shadowRoot?.querySelector('w3m-legal-footer')).toBeNull()
    expect(el.shadowRoot?.querySelector('w3m-onramp-providers-footer')).toBeNull()
  })

  it('should render legal footer for views with legal footer', async () => {
    vi.spyOn(HelpersUtil, 'hasFooter').mockReturnValue(true)
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      view: 'Connect'
    })

    const el = await fixture(html`<w3m-footer></w3m-footer>`)
    await elementUpdated(el)

    const container = el.shadowRoot?.querySelector('div.container')
    expect(container?.getAttribute('status')).toBe('show')
    expect(el.shadowRoot?.querySelector('w3m-legal-footer')).toBeTruthy()
  })

  it('should render onramp providers footer for OnRampProviders view', async () => {
    vi.spyOn(HelpersUtil, 'hasFooter').mockReturnValue(true)
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      view: 'OnRampProviders'
    })

    const el = await fixture(html`<w3m-footer></w3m-footer>`)
    await elementUpdated(el)

    expect(el.shadowRoot?.querySelector('w3m-onramp-providers-footer')).toBeTruthy()
  })

  it('should render networks footer and handle help click', async () => {
    vi.spyOn(HelpersUtil, 'hasFooter').mockReturnValue(true)
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      view: 'Networks'
    })

    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')
    const pushSpy = vi.spyOn(RouterController, 'push')

    const el = await fixture(html`<w3m-footer></w3m-footer>`)
    await elementUpdated(el)

    const text = el.shadowRoot?.querySelector('wui-text')
    expect(text).toBeTruthy()

    const link = el.shadowRoot?.querySelector('wui-link') as HTMLElement | null
    expect(link).toBeTruthy()

    link?.click()

    expect(sendEventSpy).toHaveBeenCalledWith({ type: 'track', event: 'CLICK_NETWORK_HELP' })
    expect(pushSpy).toHaveBeenCalledWith('WhatIsANetwork')
  })
})
