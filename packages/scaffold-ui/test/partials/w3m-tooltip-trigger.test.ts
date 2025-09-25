import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ModalController, RouterController, TooltipController } from '@reown/appkit-controllers'

import '../../src/partials/w3m-tooltip-trigger/index'

describe('W3mTooltipTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(TooltipController, 'showTooltip').mockImplementation(vi.fn())
    vi.spyOn(TooltipController, 'hide').mockImplementation(vi.fn())
    vi.spyOn(RouterController, 'subscribeKey').mockImplementation((_k: any, _cb: any) => vi.fn())
    vi.spyOn(ModalController, 'subscribeKey').mockImplementation((_k: any, _cb: any) => vi.fn())
    vi.spyOn(TooltipController, 'subscribeKey').mockImplementation((_k: any, _cb: any) => vi.fn())
  })

  it('should show tooltip on pointermove when closed and hides on pointerleave', async () => {
    const el = await fixture(
      html`<w3m-tooltip-trigger text="Hello"><button>child</button></w3m-tooltip-trigger>`
    )

    const container = el.shadowRoot?.querySelector('div')!
    container.dispatchEvent(new MouseEvent('pointermove'))
    await elementUpdated(el)
    expect(TooltipController.showTooltip).toHaveBeenCalled()

    container.dispatchEvent(new MouseEvent('pointerleave', { relatedTarget: document.body }))
    await elementUpdated(el)
    expect(TooltipController.hide).toHaveBeenCalled()
  })
})
