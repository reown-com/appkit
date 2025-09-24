import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { Balance } from '@reown/appkit-common'
import { ConstantsUtil, RouterController, SendController } from '@reown/appkit-controllers'
import { UiHelperUtil } from '@reown/appkit-ui'

import { W3mInputToken } from '../../src/partials/w3m-input-token'

// --- Constants ---------------------------------------------------- //
const MOCK_TOKEN: Balance = {
  address: '0x123',
  symbol: 'MOCK',
  name: 'Mock Token',
  quantity: {
    decimals: '18',
    numeric: '100'
  },
  price: 1,
  iconUrl: 'https://mock.token/icon.png'
} as unknown as Balance

const MOCK_NATIVE_TOKEN: Balance = {
  address: ConstantsUtil.NATIVE_TOKEN_ADDRESS.eip155,
  chainId: '1',
  symbol: 'ETH',
  name: 'Ethereum',
  quantity: {
    decimals: '18',
    numeric: '10'
  },
  price: 2000,
  iconUrl: 'https://ethereum.org/eth.png'
} as unknown as Balance

describe('W3mInputToken', () => {
  beforeAll(() => {
    vi.spyOn(UiHelperUtil, 'roundNumber').mockImplementation(num => num?.toString() ?? '')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render disabled input when no token is selected', async () => {
    const element: W3mInputToken = await fixture(html`<w3m-input-token></w3m-input-token>`)

    const input = element.shadowRoot?.querySelector('wui-input-amount')
    expect(input?.getAttribute('disabled')).toBe('')

    const selectButton = element.shadowRoot?.querySelector('wui-button')
    expect(selectButton?.textContent?.trim()).toBe('Select token')
  })

  it('should render token button with correct details when token is provided', async () => {
    const element: W3mInputToken = await fixture(
      html`<w3m-input-token .token=${MOCK_TOKEN}></w3m-input-token>`
    )

    const tokenButton = element.shadowRoot?.querySelector('wui-token-button')
    expect(tokenButton?.getAttribute('text')).toBe(MOCK_TOKEN.symbol)
    expect(tokenButton?.getAttribute('imageSrc')).toBe(MOCK_TOKEN.iconUrl)
  })

  it('should navigate to select token view when token button is clicked', async () => {
    const pushSpy = vi.spyOn(RouterController, 'push')
    const element: W3mInputToken = await fixture(
      html`<w3m-input-token .token=${MOCK_TOKEN}></w3m-input-token>`
    )

    const tokenButton = element.shadowRoot?.querySelector('wui-token-button')
    tokenButton?.click()

    expect(pushSpy).toHaveBeenCalledWith('WalletSendSelectToken')
  })

  it('should display total value when token amount is set', async () => {
    const element: W3mInputToken = await fixture(
      html`<w3m-input-token .token=${MOCK_TOKEN} .sendTokenAmount=${50}></w3m-input-token>`
    )

    const totalValue = element.shadowRoot?.querySelector('.totalValue')
    expect(totalValue?.textContent).toBe('$50.00')
  })

  it('should handle max amount click for non-native token', async () => {
    const setTokenAmountSpy = vi.spyOn(SendController, 'setTokenAmount')
    const element: W3mInputToken = await fixture(
      html`<w3m-input-token .token=${MOCK_TOKEN} .gasPrice=${1000000000}></w3m-input-token>`
    )

    const maxLink = element.shadowRoot?.querySelector('wui-link')
    maxLink?.click()

    expect(setTokenAmountSpy).toHaveBeenCalledWith(100)
  })

  it('should handle max amount click for native token', async () => {
    const setTokenAmountSpy = vi.spyOn(SendController, 'setTokenAmount')
    const element: W3mInputToken = await fixture(
      html`<w3m-input-token .token=${MOCK_NATIVE_TOKEN} .gasPrice=${1000000000}></w3m-input-token>`
    )

    const maxLink = element.shadowRoot?.querySelector('wui-link')
    maxLink?.click()

    // Should subtract gas from max amount for native token
    expect(setTokenAmountSpy).toHaveBeenCalled()
  })

  it('should update token amount when input changes', async () => {
    const setTokenAmountSpy = vi.spyOn(SendController, 'setTokenAmount')
    const element: W3mInputToken = await fixture(
      html`<w3m-input-token .token=${MOCK_TOKEN}></w3m-input-token>`
    )

    const input = element.shadowRoot?.querySelector('wui-input-amount')
    input?.dispatchEvent(new CustomEvent('inputChange', { detail: 75 }))

    expect(setTokenAmountSpy).toHaveBeenCalledWith(75)
  })
})
