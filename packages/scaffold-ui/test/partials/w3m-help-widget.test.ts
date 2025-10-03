import { fixture } from '@open-wc/testing'
import { describe, expect, it } from 'vitest'

import { html } from 'lit'

import '../../src/partials/w3m-help-widget/index'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mHelpWidget', () => {
  it('should render visuals, titles, and texts according to data prop', async () => {
    const DATA = [
      { images: ['globe', 'wallet'], title: 'Get a wallet', text: 'Install a compatible wallet' },
      { images: ['lock'], title: 'Stay secure', text: 'Never share your secret phrase' }
    ]

    const el = await fixture(html`<w3m-help-widget .data=${DATA}></w3m-help-widget>`)

    const visuals = HelpersUtil.querySelectAll(el, 'wui-visual')
    const titles = Array.from(HelpersUtil.querySelectAll(el, 'wui-text[variant="md-regular"]')).map(
      node => node.textContent?.trim()
    )
    const texts = Array.from(HelpersUtil.querySelectAll(el, 'wui-text[variant="sm-regular"]')).map(
      node => node.textContent?.trim()
    )

    expect(visuals.length).toBe(3)

    const visualNames = Array.from(visuals).map(v => v.getAttribute('name'))
    expect(visualNames).toEqual(['globe', 'wallet', 'lock'])

    expect(titles).toEqual(['Get a wallet', 'Stay secure'])
    expect(texts).toEqual(['Install a compatible wallet', 'Never share your secret phrase'])
  })

  it('should render nothing when data is empty', async () => {
    const el = await fixture(html`<w3m-help-widget .data=${[]}></w3m-help-widget>`)

    const visuals = HelpersUtil.querySelectAll(el, 'wui-visual')
    const titles = HelpersUtil.querySelectAll(el, 'wui-text[variant="md-regular"]')
    const texts = HelpersUtil.querySelectAll(el, 'wui-text[variant="sm-regular"]')

    expect(visuals.length).toBe(0)
    expect(titles.length).toBe(0)
    expect(texts.length).toBe(0)
  })
})
