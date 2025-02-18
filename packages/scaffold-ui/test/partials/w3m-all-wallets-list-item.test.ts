import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { AssetUtil } from '@reown/appkit-controllers'
import type { WcWallet } from '@reown/appkit-controllers'

import { W3mAllWalletsListItem } from '../../src/partials/w3m-all-wallets-list-item'

// -- Constants ----------------------------------------- //
const mockWallet: WcWallet & { installed: boolean } = {
  id: '1',
  name: 'Test Wallet',
  rdns: 'test.wallet',
  installed: false
}

const mockCertifiedWallet: WcWallet & { installed: boolean } = {
  ...mockWallet,
  badge_type: 'certified'
}

describe('W3mAllWalletsListItem', () => {
  beforeEach(() => {
    global.IntersectionObserver = vi.fn().mockImplementation(callback => ({
      observe: vi.fn(() => {
        callback([{ isIntersecting: false }], {} as IntersectionObserver)
      }),
      disconnect: vi.fn()
    }))

    vi.spyOn(AssetUtil, 'getWalletImage').mockReturnValue(undefined)
    vi.spyOn(AssetUtil, 'fetchWalletImage').mockResolvedValue('mock-image-url')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders shimmer initially when no wallet is provided', async () => {
    const element: W3mAllWalletsListItem = await fixture(
      html`<w3m-all-wallets-list-item></w3m-all-wallets-list-item>`
    )

    await element.updateComplete
    await elementUpdated(element)

    const shimmer = element.shadowRoot?.querySelector('wui-shimmer')
    expect(shimmer).toBeTruthy()
  })

  it('renders wallet name correctly', async () => {
    const element: W3mAllWalletsListItem = await fixture(
      html`<w3m-all-wallets-list-item .wallet=${mockWallet}></w3m-all-wallets-list-item>`
    )

    await element.updateComplete
    await elementUpdated(element)

    const text = element.shadowRoot?.querySelector('wui-text')
    expect(text?.textContent?.trim()).toBe(mockWallet.name)
  })

  it('shows certified badge for certified wallets', async () => {
    const element: W3mAllWalletsListItem = await fixture(
      html`<w3m-all-wallets-list-item .wallet=${mockCertifiedWallet}></w3m-all-wallets-list-item>`
    )

    await element.updateComplete
    await elementUpdated(element)

    const icon = element.shadowRoot?.querySelector('wui-icon')
    expect(icon).toBeTruthy()
    expect(icon?.getAttribute('name')).toBe('walletConnectBrown')
  })

  it('does not show certified badge for non-certified wallets', async () => {
    const element: W3mAllWalletsListItem = await fixture(
      html`<w3m-all-wallets-list-item .wallet=${mockWallet}></w3m-all-wallets-list-item>`
    )

    await element.updateComplete
    await elementUpdated(element)

    const icon = element.shadowRoot?.querySelector('wui-icon')
    expect(icon).toBeFalsy()
  })

  it('fetches and displays wallet image when visible', async () => {
    global.IntersectionObserver = vi.fn().mockImplementation(callback => ({
      observe: vi.fn(() => {
        callback([{ isIntersecting: true }], {} as IntersectionObserver)
      }),
      disconnect: vi.fn()
    }))

    const element: W3mAllWalletsListItem = await fixture(
      html`<w3m-all-wallets-list-item .wallet=${mockWallet}></w3m-all-wallets-list-item>`
    )

    await element.updateComplete
    await elementUpdated(element)

    await new Promise(resolve => setTimeout(resolve, 0))
    await elementUpdated(element)

    const walletImage = element.shadowRoot?.querySelector('wui-wallet-image')
    expect(walletImage).toBeTruthy()
    expect(walletImage?.getAttribute('imageSrc')).toBe('mock-image-url')
  })

  it('shows shimmer while image is loading', async () => {
    vi.useFakeTimers()

    global.IntersectionObserver = vi.fn().mockImplementation(callback => ({
      observe: vi.fn(() => {
        callback([{ isIntersecting: true }], {} as IntersectionObserver)
      }),
      disconnect: vi.fn()
    }))

    vi.spyOn(AssetUtil, 'fetchWalletImage').mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return 'mock-image-url'
    })

    const element: W3mAllWalletsListItem = await fixture(
      html`<w3m-all-wallets-list-item .wallet=${mockWallet}></w3m-all-wallets-list-item>`
    )

    await element.updateComplete
    await elementUpdated(element)

    const shimmer = element.shadowRoot?.querySelector('wui-shimmer')
    expect(shimmer).toBeTruthy()

    // Wait for image to load
    await vi.runAllTimersAsync()
    await elementUpdated(element)

    const walletImage = element.shadowRoot?.querySelector('wui-wallet-image')
    expect(walletImage).toBeTruthy()

    vi.useRealTimers()
  })

  it('disconnects observer when component is disconnected', async () => {
    const disconnectSpy = vi.fn()
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: disconnectSpy
    }))

    const element: W3mAllWalletsListItem = await fixture(
      html`<w3m-all-wallets-list-item .wallet=${mockWallet}></w3m-all-wallets-list-item>`
    )

    await element.updateComplete
    element.disconnectedCallback()
    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('uses cached image if available through getWalletImage', async () => {
    global.IntersectionObserver = vi.fn().mockImplementation(callback => ({
      observe: vi.fn(() => {
        callback([{ isIntersecting: true }], {} as IntersectionObserver)
      }),
      disconnect: vi.fn()
    }))

    vi.spyOn(AssetUtil, 'getWalletImage').mockReturnValue('cached-image-url')
    const fetchSpy = vi.spyOn(AssetUtil, 'fetchWalletImage')

    const element: W3mAllWalletsListItem = await fixture(
      html`<w3m-all-wallets-list-item .wallet=${mockWallet}></w3m-all-wallets-list-item>`
    )

    await element.updateComplete
    await elementUpdated(element)

    const walletImage = element.shadowRoot?.querySelector('wui-wallet-image')
    expect(walletImage?.getAttribute('imageSrc')).toBe('cached-image-url')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
