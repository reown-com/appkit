import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { NumberUtil } from '@reown/appkit-common'
import type { CaipNetwork } from '@reown/appkit-common'
import { ChainController, SwapController } from '@reown/appkit-core'
import type { SwapTokenWithBalance } from '@reown/appkit-core'

import { WuiSwapDetails } from '../../src/partials/w3m-swap-details'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants ----------------------------------------- //
const MOCK_SOURCE_TOKEN = {
  symbol: 'ETH',
  decimals: 18,
  address: 'eip155:1:0x123',
  name: 'Ethereum',
  logoUri: 'https://ethereum.org/eth-logo.png',
  chainId: 1,
  quantity: {
    decimals: '18',
    numeric: '1.0'
  },
  price: 2000,
  value: 2000
} as SwapTokenWithBalance

const MOCK_TO_TOKEN = {
  symbol: 'USDC',
  decimals: 6,
  address: 'eip155:1:0x456',
  name: 'USD Coin',
  logoUri: 'https://usdc.com/logo.png',
  chainId: 1,
  quantity: {
    decimals: '6',
    numeric: '1000.0'
  },
  price: 1,
  value: 1000
} as SwapTokenWithBalance

const MOCK_NETWORK: CaipNetwork = {
  id: 1,
  name: 'Ethereum',
  assets: {
    imageId: 'ethereum',
    imageUrl: undefined
  },
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://eth.llamarpc.com']
    }
  }
}

describe('WuiSwapDetails', () => {
  beforeAll(() => {
    Element.prototype.animate = vi.fn()
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: MOCK_NETWORK
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not render if source token, to token or input error exists', async () => {
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...SwapController.state,
      sourceToken: undefined,
      toToken: undefined,
      inputError: undefined
    })

    const element: WuiSwapDetails = await fixture(html`<w3m-swap-details></w3m-swap-details>`)
    const container = HelpersUtil.querySelect(element, '.details-container')
    expect(container).toBeNull()
  })

  it('should render swap details when all required data is present', async () => {
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...SwapController.state,
      sourceToken: MOCK_SOURCE_TOKEN,
      toToken: MOCK_TO_TOKEN,
      toTokenAmount: '1000000',
      sourceTokenPriceInUSD: 2000,
      toTokenPriceInUSD: 1,
      gasPriceInUSD: 5,
      priceImpact: 0.5,
      maxSlippage: 0.5,
      networkTokenSymbol: 'ETH',
      inputError: undefined
    })

    const element: WuiSwapDetails = await fixture(html`<w3m-swap-details></w3m-swap-details>`)

    const container = HelpersUtil.querySelect(element, '.details-container')
    expect(container).not.toBeNull()

    const tokenRate = HelpersUtil.querySelect(element, 'wui-text')
    expect(tokenRate?.textContent).toContain('1 ETH =')
  })

  it('should toggle details when clicked', async () => {
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...SwapController.state,
      sourceToken: MOCK_SOURCE_TOKEN,
      toToken: MOCK_TO_TOKEN,
      toTokenAmount: '1000000',
      sourceTokenPriceInUSD: 2000,
      toTokenPriceInUSD: 1,
      gasPriceInUSD: 5,
      priceImpact: 0.5,
      maxSlippage: 0.5,
      networkTokenSymbol: 'ETH',
      inputError: undefined
    })

    const element: WuiSwapDetails = await fixture(html`<w3m-swap-details></w3m-swap-details>`)

    expect(element.detailsOpen).toBe(false)

    const button = HelpersUtil.querySelect(element, 'button')
    button?.click()
    await elementUpdated(element)

    expect(element.detailsOpen).toBe(true)

    const detailsContent = HelpersUtil.querySelect(element, '.details-content-container')
    expect(detailsContent).not.toBeNull()
  })

  it('should display network cost correctly', async () => {
    const GAS_PRICE = 5
    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...SwapController.state,
      sourceToken: MOCK_SOURCE_TOKEN,
      toToken: MOCK_TO_TOKEN,
      gasPriceInUSD: GAS_PRICE,
      networkTokenSymbol: 'ETH',
      inputError: undefined
    })

    const element: WuiSwapDetails = await fixture(html`<w3m-swap-details></w3m-swap-details>`)

    element.detailsOpen = true
    await elementUpdated(element)

    const networkCostText = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || []).find(
      text => text.textContent?.includes('$5')
    )

    expect(networkCostText).not.toBeNull()
  })

  it('should calculate and display min received amount correctly', async () => {
    const TO_TOKEN_AMOUNT = '1000000'
    const MAX_SLIPPAGE = 0.5

    vi.spyOn(SwapController, 'state', 'get').mockReturnValue({
      ...SwapController.state,
      sourceToken: MOCK_SOURCE_TOKEN,
      toToken: MOCK_TO_TOKEN,
      toTokenAmount: TO_TOKEN_AMOUNT,
      maxSlippage: MAX_SLIPPAGE,
      inputError: undefined
    })

    const element: WuiSwapDetails = await fixture(html`<w3m-swap-details></w3m-swap-details>`)

    element.detailsOpen = true
    await elementUpdated(element)

    const expectedMinAmount = NumberUtil.bigNumber(TO_TOKEN_AMOUNT).minus(MAX_SLIPPAGE).toString()

    const slippageText = Array.from(element.shadowRoot?.querySelectorAll('wui-text') || []).find(
      text => text.textContent?.includes(expectedMinAmount)
    )

    expect(slippageText).not.toBeNull()
  })
})
