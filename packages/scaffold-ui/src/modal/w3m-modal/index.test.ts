import { W3mModal } from './index'
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { fixture } from '@open-wc/testing'
import { html } from 'lit'
import { ModalController, OptionsController } from '@reown/appkit-core'
import { HelpersUtil } from '../../../test/utils/HelpersUtil'

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

describe('W3mModal - Embedded Mode', () => {
  let element: W3mModal

  beforeEach(async () => {
    // Reset controllers state
    OptionsController.setEnableEmbedded(true)
    ModalController.close()

    // Create the modal element
    element = await fixture(html`<w3m-modal .enableEmbedded=${true}></w3m-modal>`)
  })

  it('should be visible when embedded is enabled', () => {
    expect(element).toBeTruthy()

    const card = HelpersUtil.getByTestId(element, 'w3m-modal-card')
    expect(card).toBeTruthy()

    expect(element.shadowRoot?.querySelector('w3m-header')).toBeTruthy()
    expect(element.shadowRoot?.querySelector('w3m-router')).toBeTruthy()
    expect(element.shadowRoot?.querySelector('w3m-snackbar')).toBeTruthy()
    expect(element.shadowRoot?.querySelector('w3m-alertbar')).toBeTruthy()
    expect(element.shadowRoot?.querySelector('w3m-tooltip')).toBeTruthy()
  })

  it('should not render overlay in embedded mode', () => {
    const overlay = HelpersUtil.getByTestId(element, 'w3m-modal-overlay')
    expect(overlay).toBeNull()
  })

  it('should close modal when wallet is connected', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      enableEmbedded: true
    })

    ModalController.open()
    await element.updateComplete
    ;(element as any).caipAddress = 'eip155:1:0x123...'
    await element.updateComplete

    expect(ModalController.state.open).toBe(false)
  })
})
