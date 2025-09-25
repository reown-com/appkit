import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import '../../src/partials/w3m-router-container/index'
import type { W3mRouterContainer } from '../../src/partials/w3m-router-container/index'

describe('W3mRouterContainer', () => {
  beforeAll(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  it('should apply transition CSS variables on firstUpdated and updates on prop change', async () => {
    const el = (await fixture(
      html`<w3m-router-container
        transitionDuration="0.2s"
        transitionFunction="ease-in"
      ></w3m-router-container>`
    )) as W3mRouterContainer
    const style = el.style.cssText
    expect(style).toContain('--local-duration: 0.2s')
    expect(style).toContain('--local-transition: ease-in')

    el.transitionDuration = '0.2s'
    await elementUpdated(el)
    expect(el.style.cssText).toContain('--local-duration: 0.2s')
  })

  it('should compute viewDirection and calls setView on history change', async () => {
    const setView = vi.fn()
    const el = await fixture(
      html`<w3m-router-container
        transitionDuration="0.01s"
        .setView=${setView}
        history="A"
      ></w3m-router-container>`
    )
    expect((el as any).viewDirection).toBe('')
    ;(el as any).history = 'A,B'
    await elementUpdated(el)
    expect((el as any).viewDirection).toContain('next-B')

    await vi.waitFor(() => {
      expect(setView).toHaveBeenCalledWith('B')
      expect((el as any).viewDirection).toBe('')
    })
  })

  it('should render slot content within page-content', async () => {
    const el = (await fixture(
      html`<w3m-router-container><div id="child">child</div></w3m-router-container>`
    )) as W3mRouterContainer
    const child = el.querySelector('#child')
    expect(child).toBeTruthy()
  })
})
