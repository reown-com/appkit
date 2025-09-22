import { fixture } from '@open-wc/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type AccountState,
  ChainController,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'

import { W3mAccountTokensWidget } from '../../src/partials/w3m-account-tokens-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants ----------------------------------------- //
const LIST_TOKEN = 'wui-list-token'
const BUY_CRYPTO = 'w3m-account-onramp-button'
const RECEIVE_CRYPTO = 'w3m-account-receive-button'

const BALANCE = {
  name: 'Ethereum',
  symbol: 'ETH',
  chainId: '1',
  price: 1000,
  quantity: {
    decimals: '18',
    numeric: '1'
  },
  iconUrl: 'xyz'
} as const

describe('W3mAccountTokensWidget', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('it should show default content if no tokens exist', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: {
        onramp: ['meld']
      }
    })

    const accountTokensWidget: W3mAccountTokensWidget = await fixture(
      html`<w3m-account-tokens-widget></w3m-account-tokens-widget>`
    )

    const buyCrypto = HelpersUtil.getByTestId(accountTokensWidget, BUY_CRYPTO)
    const receiveFunds = HelpersUtil.getByTestId(accountTokensWidget, RECEIVE_CRYPTO)

    expect(buyCrypto.shadowRoot?.textContent).toContain('Buy Crypto')
    expect(receiveFunds.shadowRoot?.textContent).toContain('Receive funds')
  })

  it('it should navigate to different screens based on what option is clicked', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: {
        onramp: ['meld']
      }
    })
    vi.spyOn(RouterController, 'push')
    const accountTokensWidget: W3mAccountTokensWidget = await fixture(
      html`<w3m-account-tokens-widget></w3m-account-tokens-widget>`
    )
    const buyCrypto = HelpersUtil.getByTestId(accountTokensWidget, BUY_CRYPTO)
    const receiveFunds = HelpersUtil.getByTestId(accountTokensWidget, RECEIVE_CRYPTO)

    buyCrypto.click()
    expect(RouterController.push).toHaveBeenCalledWith('OnRampProviders')

    receiveFunds.click()
    expect(RouterController.push).toHaveBeenCalledWith('WalletReceive')
  })

  it('it should display token balances if tokens exist', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      tokenBalance: [BALANCE, BALANCE]
    } as unknown as AccountState)

    const accountTokensWidget: W3mAccountTokensWidget = await fixture(
      html`<w3m-account-tokens-widget></w3m-account-tokens-widget>`
    )
    const listTokens = Array.from(
      accountTokensWidget.shadowRoot?.querySelectorAll(LIST_TOKEN) || []
    )

    expect(listTokens.length).toBe(2)
  })
})
