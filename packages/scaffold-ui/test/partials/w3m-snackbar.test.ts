import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { SnackController } from '@reown/appkit-controllers'

import '../../src/partials/w3m-snackbar/index'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mSnackBar', () => {
  beforeAll(() => {
    Element.prototype.animate = vi.fn()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(SnackController, 'state', 'get').mockReturnValue({
      ...SnackController.state,
      message: 'Hello',
      variant: 'success',
      open: false,
      autoClose: true
    })
    vi.spyOn(SnackController, 'hide').mockImplementation(vi.fn())
  })

  it('should render message and variant from controller state', async () => {
    const el = await fixture(html`<w3m-snackbar></w3m-snackbar>`)
    const snackbar = HelpersUtil.querySelect(el, 'wui-snackbar')

    expect(snackbar?.getAttribute('message')).toBe('Hello')
    expect(snackbar?.getAttribute('variant')).toBe('success')
  })

  it('should animate on open and schedules auto-close', async () => {
    vi.spyOn(SnackController, 'state', 'get').mockReturnValue({
      ...SnackController.state,
      open: true
    })
    const el = await fixture(html`<w3m-snackbar></w3m-snackbar>`)

    ;(el as any).onOpen()
    await elementUpdated(el)

    expect(Element.prototype.animate).toHaveBeenCalled()
  })
})
