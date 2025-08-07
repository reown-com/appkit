import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ApiController } from '@reown/appkit-controllers'

import { W3mOnRampActivityItem } from '../../src/partials/w3m-onramp-activity-item'

describe('W3mOnRampActivityItem', () => {
  beforeEach(() => {
    vi.spyOn(ApiController, '_fetchTokenImage').mockResolvedValue()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render with default properties', async () => {
    const element: W3mOnRampActivityItem = await fixture(
      html`<w3m-onramp-activity-item></w3m-onramp-activity-item>`
    )

    expect(element.disabled).toBe(false)
    expect(element.color).toBe('inherit')
    expect(element.label).toBe('Bought')
    expect(element.purchaseValue).toBe('')
    expect(element.purchaseCurrency).toBe('')
    expect(element.date).toBe('')
    expect(element.completed).toBe(false)
    expect(element.inProgress).toBe(false)
    expect(element.failed).toBe(false)
    expect(element.onClick).toBe(null)
    expect(element.symbol).toBe('')
  })

  it('should render with custom properties', async () => {
    const element: W3mOnRampActivityItem = await fixture(
      html`<w3m-onramp-activity-item
        label="Test Purchase"
        purchaseValue="100"
        purchaseCurrency="ETH"
        date="2024-03-20"
        .completed=${true}
      ></w3m-onramp-activity-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const labelText = element.shadowRoot?.querySelector('wui-text')
    expect(labelText?.textContent?.trim()).toBe('Test Purchase')

    const purchaseText = element.shadowRoot?.querySelector('wui-text[color="secondary"]')
    expect(purchaseText?.textContent?.trim()).toBe('+ 100 ETH')

    const dateText = element.shadowRoot?.querySelector('wui-text[color="tertiary"]')
    expect(dateText?.textContent?.trim()).toBe('2024-03-20')
  })

  it('should show loading spinner when in progress', async () => {
    const element: W3mOnRampActivityItem = await fixture(
      html`<w3m-onramp-activity-item .inProgress=${true}></w3m-onramp-activity-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const spinner = element.shadowRoot?.querySelector('wui-loading-spinner')
    expect(spinner).not.toBeNull()
  })

  it('should show success icon when completed', async () => {
    const element: W3mOnRampActivityItem = await fixture(
      html`<w3m-onramp-activity-item .completed=${true}></w3m-onramp-activity-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const successIcon = element.shadowRoot?.querySelector('wui-icon-box[icon="arrowBottom"]')
    expect(successIcon).not.toBeNull()
    expect(successIcon?.getAttribute('color')).toBe('success')
  })

  it('should show error icon when failed', async () => {
    const element: W3mOnRampActivityItem = await fixture(
      html`<w3m-onramp-activity-item .failed=${true}></w3m-onramp-activity-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const errorIcon = element.shadowRoot?.querySelector('wui-icon-box[icon="close"]')
    expect(errorIcon).not.toBeNull()
    expect(errorIcon?.getAttribute('color')).toBe('error')
  })

  it('should fetch token image if icon is not provided', async () => {
    const fetchTokenImageSpy = vi.spyOn(ApiController, '_fetchTokenImage')

    await fixture(
      html`<w3m-onramp-activity-item purchaseCurrency="ETH"></w3m-onramp-activity-item>`
    )

    expect(fetchTokenImageSpy).toHaveBeenCalledWith('ETH')
  })

  it('should not fetch token image if icon is provided', async () => {
    const fetchTokenImageSpy = vi.spyOn(ApiController, '_fetchTokenImage')

    await fixture(
      html`<w3m-onramp-activity-item
        icon="custom-icon.png"
        purchaseCurrency="ETH"
      ></w3m-onramp-activity-item>`
    )

    expect(fetchTokenImageSpy).not.toHaveBeenCalled()
  })

  it('should use fallback image when no icon is provided', async () => {
    const element: W3mOnRampActivityItem = await fixture(
      html`<w3m-onramp-activity-item symbol="ETH"></w3m-onramp-activity-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const image = element.shadowRoot?.querySelector('wui-image')
    expect(image?.getAttribute('src')).toBe('https://avatar.vercel.sh/andrew.svg?size=50&text=ETH')
  })
})
