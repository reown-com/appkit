import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { TooltipController } from '@reown/appkit-controllers'

import '../../src/partials/w3m-tooltip/index'
import type { W3mTooltip } from '../../src/partials/w3m-tooltip/index'

describe('W3mTooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(TooltipController, 'state', 'get').mockReturnValue({
      ...TooltipController.state,
      open: true,
      message: 'Tip text',
      triggerRect: { top: 10, left: 20, width: 100, height: 20 },
      variant: 'shade'
    })
  })

  it('should set style variables and render message', async () => {
    const el = (await fixture(html`<w3m-tooltip></w3m-tooltip>`)) as W3mTooltip
    const style = el.style.cssText

    expect(style).toContain('--w3m-tooltip-top: 10px')
    expect(style).toContain('--w3m-tooltip-left: 20px')
    expect(style).toContain('--w3m-tooltip-parent-width: 50px')
    expect(style).toContain('--w3m-tooltip-display: flex')
    expect(style).toContain('--w3m-tooltip-opacity: 1')

    expect(el.shadowRoot?.textContent).toContain('Tip text')
    expect(el.dataset['variant']).toBe('shade')
  })
})
