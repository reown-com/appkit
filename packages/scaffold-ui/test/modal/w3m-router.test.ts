import { W3mRouter } from '../../src/modal/w3m-router'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import { RouterController, TooltipController, type RouterControllerState } from '@reown/appkit-core'
import { HelpersUtil } from '../utils/HelpersUtil'
import { ConstantsUtil } from '../../src/utils/ConstantsUtil'

describe('W3mRouter', () => {
  beforeEach(() => {
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      view: 'Connect',
      history: ['Connect']
    } as RouterControllerState)

    vi.spyOn(RouterController, 'subscribeKey').mockImplementation(() => () => {})
    vi.spyOn(TooltipController, 'hide').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders default Connect view', async () => {
    const element: W3mRouter = await fixture(html`<w3m-router></w3m-router>`)
    expect(HelpersUtil.querySelect(element, 'w3m-connect-view')).toBeTruthy()
  })

  it('handles view change with animation', async () => {
    const element: W3mRouter = await fixture(html`<w3m-router></w3m-router>`)
    const container = HelpersUtil.querySelect(element, '.w3m-router-container')

    // Initial state
    expect(container?.getAttribute('view-direction')).toBe('')

    // Trigger view change
    const subscribeKeySpy = vi.spyOn(RouterController, 'subscribeKey')
    const viewCallback = subscribeKeySpy.mock.calls.find(call => call[0] === 'view')?.[1]

    if (viewCallback) {
      vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
        view: 'Networks',
        history: ['Connect', 'Networks']
      } as RouterControllerState)
      viewCallback('Networks')
    }

    element.requestUpdate()
    await elementUpdated(element)

    expect(container?.getAttribute('view-direction')).toBe(ConstantsUtil.VIEW_DIRECTION.Next)
    expect(TooltipController.hide).toHaveBeenCalled()

    // Wait for view transition
    await new Promise(resolve =>
      setTimeout(resolve, ConstantsUtil.ANIMATION_DURATIONS.ViewTransition)
    )

    expect(HelpersUtil.querySelect(element, 'w3m-networks-view')).toBeTruthy()
  })

  it('handles back navigation with correct animation', async () => {
    const element: W3mRouter = await fixture(html`<w3m-router></w3m-router>`)
    const container = HelpersUtil.querySelect(element, '.w3m-router-container')

    // Setup initial history state
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      view: 'Networks',
      history: ['Connect', 'Networks']
    } as RouterControllerState)

    // Simulate going back
    const subscribeKeySpy = vi.spyOn(RouterController, 'subscribeKey')
    const viewCallback = subscribeKeySpy.mock.calls.find(call => call[0] === 'view')?.[1]

    if (viewCallback) {
      vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
        view: 'Connect',
        history: ['Connect']
      } as RouterControllerState)
      viewCallback('Connect')
    }

    element.requestUpdate()
    await elementUpdated(element)

    expect(container?.getAttribute('view-direction')).toBe(ConstantsUtil.VIEW_DIRECTION.Prev)
  })

  it('sets up and cleans up resize observer', async () => {
    const observeSpy = vi.fn()
    const unobserveSpy = vi.fn()

    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: observeSpy,
      unobserve: unobserveSpy,
      disconnect: vi.fn()
    }))

    const element: W3mRouter = await fixture(html`<w3m-router></w3m-router>`)
    expect(observeSpy).toHaveBeenCalled()

    element.disconnectedCallback()
    expect(unobserveSpy).toHaveBeenCalled()
  })

  it('renders supported views correctly', async () => {
    const element: W3mRouter = await fixture(html`<w3m-router></w3m-router>`)
    const views: W3mRouter['view'][] = [
      'Networks',
      'Account',
      'AllWallets',
      'Connect'
      //....
    ]

    for (const view of views) {
      const subscribeKeySpy = vi.spyOn(RouterController, 'subscribeKey')
      const viewCallback = subscribeKeySpy.mock.calls.find(call => call[0] === 'view')?.[1]

      if (viewCallback) {
        vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
          view,
          history: [view]
        } as RouterControllerState)
        viewCallback(view)
      }

      // Wait for view transition
      await new Promise(resolve =>
        setTimeout(resolve, ConstantsUtil.ANIMATION_DURATIONS.ViewTransition)
      )

      element.requestUpdate()
      await elementUpdated(element)

      expect(HelpersUtil.querySelect(element, `w3m-${view.toLowerCase()}-view`)).toBeTruthy()
    }
  })
})
