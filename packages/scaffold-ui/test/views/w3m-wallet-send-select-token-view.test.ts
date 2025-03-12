import { expect, fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, it, vi, expect as viExpect } from 'vitest'

import type { Balance, CaipNetwork } from '@reown/appkit-common'
import { ChainController, RouterController, SendController } from '@reown/appkit-core'

import { W3mSendSelectTokenView } from '../../src/views/w3m-wallet-send-select-token-view'

const mockTokens: Balance[] = [
  {
    address: '0x123',
    symbol: 'TEST1',
    name: 'Test Token 1',
    quantity: {
      numeric: '100',
      decimals: '18'
    },
    price: 1,
    chainId: 'eip155:1',
    iconUrl: 'https://example.com/icon1.png',
    value: 100
  },
  {
    address: '0x456',
    symbol: 'TEST2',
    name: 'Test Token 2',
    quantity: {
      numeric: '200',
      decimals: '18'
    },
    price: 2,
    chainId: 'eip155:1',
    iconUrl: 'https://example.com/icon2.png',
    value: 400
  },
  {
    address: '0x789',
    symbol: 'TEST3',
    name: 'Different Chain Token',
    quantity: {
      numeric: '300',
      decimals: '18'
    },
    price: 1,
    chainId: 'eip155:2',
    iconUrl: 'https://example.com/icon3.png',
    value: 300
  }
]

const mockNetwork: CaipNetwork = {
  id: 1,
  name: 'Ethereum',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://ethereum.rpc.com']
    }
  }
}

describe('W3mSendSelectTokenView', () => {
  beforeEach(() => {
    vi.spyOn(SendController.state, 'tokenBalances', 'get').mockReturnValue(mockTokens)
    vi.spyOn(ChainController.state, 'activeCaipNetwork', 'get').mockReturnValue(mockNetwork)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render initial state with filtered tokens by chain', async () => {
    const element = await fixture<W3mSendSelectTokenView>(
      html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`
    )

    await element.updateComplete

    const tokenElements = element.shadowRoot?.querySelectorAll('wui-list-token')
    expect(tokenElements?.length).to.equal(2)

    const searchInput = element.shadowRoot?.querySelector('wui-input-text')
    expect(searchInput).to.exist
  })

  it('should filter tokens by search input', async () => {
    const element = await fixture<W3mSendSelectTokenView>(
      html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`
    )

    element['search'] = 'Test Token 1'
    await element.updateComplete

    const tokenElements = element.shadowRoot?.querySelectorAll('wui-list-token')
    expect(tokenElements?.length).to.equal(1)
    expect(tokenElements?.[0]?.getAttribute('tokenName')).to.equal('Test Token 1')
  })

  it('should show empty state when no tokens match filter', async () => {
    const element = await fixture<W3mSendSelectTokenView>(
      html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`
    )

    element['search'] = 'Non Existent Token'
    await element.updateComplete

    const noTokensText = element.shadowRoot?.querySelector('wui-text[color="fg-100"]')
    expect(noTokensText?.textContent?.trim()).to.equal('No tokens found')
  })

  it('should handle token selection', async () => {
    const routerSpy = vi.spyOn(RouterController, 'goBack')
    const sendControllerSpy = vi.spyOn(SendController, 'setToken')

    const element = await fixture<W3mSendSelectTokenView>(
      html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`
    )

    await element.updateComplete

    const tokenElements = element.shadowRoot?.querySelectorAll('wui-list-token')
    tokenElements?.[0]?.click()

    viExpect(sendControllerSpy).toHaveBeenCalledWith(mockTokens[0])
    viExpect(routerSpy).toHaveBeenCalled()
  })

  it('should navigate to OnRampProviders on buy click', async () => {
    const routerSpy = vi.spyOn(RouterController, 'push')
    vi.spyOn(SendController.state, 'tokenBalances', 'get').mockReturnValue([])

    const element = await fixture<W3mSendSelectTokenView>(
      html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`
    )

    await element.updateComplete

    const buyLink = element.shadowRoot?.querySelector('wui-link')
    buyLink?.click()

    viExpect(routerSpy).toHaveBeenCalledWith('OnRampProviders')
  })

  it('should cleanup subscriptions on disconnect', async () => {
    const element = await fixture<W3mSendSelectTokenView>(
      html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`
    )

    const unsubscribeSpy = vi.fn()
    element['unsubscribe'] = [unsubscribeSpy]

    element.disconnectedCallback()
    viExpect(unsubscribeSpy).toHaveBeenCalled()
  })

  it('should show all tokens when search is cleared', async () => {
    const element = await fixture<W3mSendSelectTokenView>(
      html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`
    )

    element['search'] = 'Test Token 1'
    await element.updateComplete

    let tokenElements = element.shadowRoot?.querySelectorAll('wui-list-token')
    expect(tokenElements?.length).to.equal(1)

    element['search'] = ''
    await element.updateComplete

    tokenElements = element.shadowRoot?.querySelectorAll('wui-list-token')
    expect(tokenElements?.length).to.equal(2)
  })
})
