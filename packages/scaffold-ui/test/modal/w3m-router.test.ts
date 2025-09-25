import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { RouterController } from '@reown/appkit-controllers'

import '../../src/modal/w3m-router'

describe('W3mRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
  })

  it('should render connect view by default', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      view: 'Connect',
      history: ['Connect']
    })

    const el = await fixture(html`<w3m-router></w3m-router>`)
    await elementUpdated(el)

    const container = el.shadowRoot?.querySelector('w3m-router-container')

    expect(container).toBeTruthy()
    expect(container?.getAttribute('history')).toBe('Connect')
  })

  it('should render different views based on router state', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      view: 'Account',
      history: ['Connect', 'Account']
    })

    const el = await fixture(html`<w3m-router></w3m-router>`)
    await elementUpdated(el)

    const container = el.shadowRoot?.querySelector('w3m-router-container')
    expect(container?.getAttribute('history')).toBe('Connect,Account')
  })

  it('should render router container with history attribute', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      view: 'Account',
      history: ['Connect', 'Account']
    })

    const el = await fixture(html`<w3m-router></w3m-router>`)
    await elementUpdated(el)

    const container = el.shadowRoot?.querySelector('w3m-router-container')
    expect(container).toBeTruthy()
    expect(container?.getAttribute('history')).toBe('Connect,Account')
  })
})
