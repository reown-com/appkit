import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { type CaipNetwork, type ChainNamespace } from '@reown/appkit-common'
import { AssetUtil, ChainController } from '@reown/appkit-controllers'

import { W3mOnRampProviderItem } from '../../src/partials/w3m-onramp-provider-item'

describe('W3mOnRampProviderItem', () => {
  beforeEach(() => {
    const mockNetworks: CaipNetwork[] = [
      {
        id: '1',
        name: 'Ethereum',
        chainNamespace: 'eip155' as ChainNamespace,
        caipNetworkId: 'eip155:1',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: {
          default: { http: ['https://eth.llamarpc.com'] }
        },
        assets: { imageId: 'ethereum', imageUrl: 'ethereum.png' }
      },
      {
        id: '137',
        name: 'Polygon',
        chainNamespace: 'eip155' as ChainNamespace,
        caipNetworkId: 'eip155:137',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: {
          default: { http: ['https://polygon.llamarpc.com'] }
        },
        assets: { imageId: 'polygon', imageUrl: 'polygon.png' }
      }
    ]

    vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue(mockNetworks)
    vi.spyOn(AssetUtil, 'getNetworkImage').mockReturnValue('network-image.png')
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render with default properties', async () => {
    const element: W3mOnRampProviderItem = await fixture(
      html`<w3m-onramp-provider-item></w3m-onramp-provider-item>`
    )

    expect(element.disabled).toBe(false)
    expect(element.color).toBe('inherit')
    expect(element.name).toBeUndefined()
    expect(element.label).toBe('')
    expect(element.feeRange).toBe('')
    expect(element.loading).toBe(false)
    expect(element.onClick).toBeNull()
  })

  it('should render with custom properties', async () => {
    const element: W3mOnRampProviderItem = await fixture(
      html`<w3m-onramp-provider-item
        name="coinbase"
        label="Coinbase"
        feeRange="1-2%"
      ></w3m-onramp-provider-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const visual = element.shadowRoot?.querySelector('wui-visual')
    expect(visual?.getAttribute('name')).toBe('coinbase')

    const labelText = element.shadowRoot?.querySelector('wui-text[variant="paragraph-500"]')
    expect(labelText?.textContent?.trim()).toBe('Coinbase')

    const feeText = element.shadowRoot?.querySelector('wui-text[variant="tiny-500"]')
    expect(feeText?.textContent?.trim()).toContain('1-2%')
  })

  it('should render loading spinner when loading is true', async () => {
    const element: W3mOnRampProviderItem = await fixture(
      html`<w3m-onramp-provider-item .loading=${true}></w3m-onramp-provider-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const spinner = element.shadowRoot?.querySelector('wui-loading-spinner')
    expect(spinner).not.toBeNull()
  })

  it('should render chevron icon when not loading', async () => {
    const element: W3mOnRampProviderItem = await fixture(
      html`<w3m-onramp-provider-item .loading=${false}></w3m-onramp-provider-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const chevron = element.shadowRoot?.querySelector('wui-icon[name="chevronRight"]')
    expect(chevron).not.toBeNull()
  })

  it('should render payment method icons', async () => {
    const element: W3mOnRampProviderItem = await fixture(
      html`<w3m-onramp-provider-item></w3m-onramp-provider-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const bankIcon = element.shadowRoot?.querySelector('wui-icon[name="bank"]')
    const cardIcon = element.shadowRoot?.querySelector('wui-icon[name="card"]')
    expect(bankIcon).not.toBeNull()
    expect(cardIcon).not.toBeNull()
  })

  it('should render network icons', async () => {
    const element: W3mOnRampProviderItem = await fixture(
      html`<w3m-onramp-provider-item></w3m-onramp-provider-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const networkImages = element.shadowRoot?.querySelectorAll('.network-icon wui-image')
    expect(networkImages?.length).toBe(2)
    networkImages?.forEach(image => {
      expect(image.getAttribute('src')).toBe('network-image.png')
    })
  })

  it('should handle disabled state', async () => {
    const element: W3mOnRampProviderItem = await fixture(
      html`<w3m-onramp-provider-item .disabled=${true}></w3m-onramp-provider-item>`
    )

    element.requestUpdate()
    await elementUpdated(element)

    const button = element.shadowRoot?.querySelector('button')
    expect(button?.disabled).toBe(true)
  })

  it('should handle click events', async () => {
    const onClick = vi.fn()
    const element: W3mOnRampProviderItem = await fixture(
      html`<w3m-onramp-provider-item></w3m-onramp-provider-item>`
    )
    element.onClick = onClick

    element.requestUpdate()
    await elementUpdated(element)

    const button = element.shadowRoot?.querySelector('button')
    button?.click()

    expect(onClick).toHaveBeenCalled()
  })
})
