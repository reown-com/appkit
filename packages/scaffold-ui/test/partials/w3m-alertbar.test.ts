import { W3mAlertBar, presets } from '../../src/partials/w3m-alertbar'
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { fixture, elementUpdated } from '@open-wc/testing'
import { AlertController } from '@reown/appkit-core'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import type { WuiAlertBar } from '@reown/appkit-ui'

// --- Constants ---------------------------------------------------- //
const ALERBAR = 'wui-alertbar'

describe('W3mAlertBar', () => {
  beforeAll(() => {
    Element.prototype.animate = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('it should display the correct alert based on the variant', async () => {
    const alertVariants = [
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

    for (const { variant, message, preset } of alertVariants) {
      AlertController.state.message = message
      AlertController.state.variant = variant

      const alertBar: W3mAlertBar = await fixture(html`<w3m-alertbar></w3m-alertbar>`)
      const {
        message: alertMessage,
        backgroundColor,
        icon,
        iconColor
      } = HelpersUtil.querySelect(alertBar, ALERBAR) as WuiAlertBar

      expect(alertMessage).toBe(message)
      expect(backgroundColor).toBe(preset.backgroundColor)
      expect(icon).toBe(preset.icon)
      expect(iconColor).toBe(preset.iconColor)
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
