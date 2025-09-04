import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { AlertController } from '@reown/appkit-controllers'
import type { WuiAlertBar } from '@reown/appkit-ui/wui-alertbar'

import { W3mAlertBar, presets } from '../../src/partials/w3m-alertbar'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const ALERBAR = 'wui-alertbar'
const ALERT_VARIANTS = [
  {
    variant: 'info',
    message: 'info message',
    preset: presets.info
  },
  {
    variant: 'success',
    message: 'success message',
    preset: presets.success
  },
  {
    variant: 'warning',
    message: 'warning message',
    preset: presets.warning
  },
  {
    variant: 'error',
    message: 'error message',
    preset: presets.error
  }
] as const

describe('W3mAlertBar', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Element.prototype.animate = vi.fn().mockReturnValue({ finished: Promise.resolve() })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('it should display the correct alert based on the variant', async () => {
    for (const { variant, message } of ALERT_VARIANTS) {
      AlertController.state.message = message
      AlertController.state.variant = variant

      const alertBar: W3mAlertBar = await fixture(html`<w3m-alertbar></w3m-alertbar>`)
      const { message: alertMessage } = HelpersUtil.querySelect(alertBar, ALERBAR) as WuiAlertBar

      expect(alertMessage).toBe(message)
    }
  })

  it('it should apply correct animations and styles based on open state', async () => {
    AlertController.state.open = false

    const alertBar: W3mAlertBar = await fixture(html`<w3m-alertbar></w3m-alertbar>`)
    const animateSpy = vi.spyOn(alertBar, 'animate')

    AlertController.state.open = true

    await alertBar.requestUpdate()
    await elementUpdated(alertBar)

    expect(animateSpy).toHaveBeenCalledWith(
      [
        { opacity: 0, transform: 'scale(0.85)' },
        { opacity: 1, transform: 'scale(1)' }
      ],
      {
        duration: 150,
        fill: 'forwards',
        easing: 'ease'
      }
    )
    expect(alertBar.style.cssText).toContain('pointer-events: auto')

    AlertController.state.open = false

    await alertBar.requestUpdate()
    await elementUpdated(alertBar)

    expect(animateSpy).toHaveBeenCalledWith(
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0.85)' }
      ],
      {
        duration: 150,
        fill: 'forwards',
        easing: 'ease'
      }
    )
    expect(alertBar.style.cssText).toContain('pointer-events: none')
  })
})
