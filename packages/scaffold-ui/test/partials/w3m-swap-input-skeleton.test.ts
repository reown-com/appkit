import { fixture } from '@open-wc/testing'
import { describe, expect, it } from 'vitest'

import { html } from 'lit'

import { W3mSwapInputSkeleton } from '../../src/partials/w3m-swap-input-skeleton'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mSwapInputSkeleton', () => {
  it('should render with default target', async () => {
    const element: W3mSwapInputSkeleton = await fixture(
      html`<w3m-swap-input-skeleton></w3m-swap-input-skeleton>`
    )

    expect(element.target).toBe('sourceToken')
  })

  it('should render with custom target', async () => {
    const element: W3mSwapInputSkeleton = await fixture(
      html`<w3m-swap-input-skeleton target="toToken"></w3m-swap-input-skeleton>`
    )

    expect(element.target).toBe('toToken')
  })

  it('should render shimmer elements', async () => {
    const element: W3mSwapInputSkeleton = await fixture(
      html`<w3m-swap-input-skeleton></w3m-swap-input-skeleton>`
    )

    const shimmers = element.shadowRoot?.querySelectorAll('wui-shimmer')
    expect(shimmers?.length).toBe(2)

    const inputShimmer = HelpersUtil.querySelect(element, '.swap-input wui-shimmer')
    expect(inputShimmer).not.toBeNull()
    expect(inputShimmer?.getAttribute('width')).toBe('80px')
    expect(inputShimmer?.getAttribute('height')).toBe('40px')
    expect(inputShimmer?.getAttribute('borderRadius')).toBe('xxs')
    expect(inputShimmer?.getAttribute('variant')).toBe('light')

    const buttonShimmer = HelpersUtil.querySelect(element, '.swap-token-button wui-shimmer')
    expect(buttonShimmer).not.toBeNull()
    expect(buttonShimmer?.getAttribute('width')).toBe('80px')
    expect(buttonShimmer?.getAttribute('height')).toBe('40px')
    expect(buttonShimmer?.getAttribute('borderRadius')).toBe('3xl')
    expect(buttonShimmer?.getAttribute('variant')).toBe('light')
  })

  it('should render flex containers with correct properties', async () => {
    const element: W3mSwapInputSkeleton = await fixture(
      html`<w3m-swap-input-skeleton></w3m-swap-input-skeleton>`
    )

    const mainFlex = HelpersUtil.querySelect(element, 'wui-flex')
    expect(mainFlex).not.toBeNull()
    expect(mainFlex?.getAttribute('justifyContent')).toBe('space-between')

    const inputFlex = HelpersUtil.querySelect(element, '.swap-input')
    expect(inputFlex).not.toBeNull()
    expect(inputFlex?.getAttribute('flex')).toBe('1')
    expect(inputFlex?.getAttribute('flexDirection')).toBe('column')
    expect(inputFlex?.getAttribute('alignItems')).toBe('flex-start')
    expect(inputFlex?.getAttribute('justifyContent')).toBe('center')
    expect(inputFlex?.getAttribute('gap')).toBe('xxs')

    const buttonFlex = HelpersUtil.querySelect(element, '.swap-token-button')
    expect(buttonFlex).not.toBeNull()
    expect(buttonFlex?.getAttribute('flexDirection')).toBe('column')
    expect(buttonFlex?.getAttribute('alignItems')).toBe('flex-end')
    expect(buttonFlex?.getAttribute('justifyContent')).toBe('center')
    expect(buttonFlex?.getAttribute('gap')).toBe('xxs')
  })
})
