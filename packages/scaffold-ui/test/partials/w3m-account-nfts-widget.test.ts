import { fixture } from '@open-wc/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { RouterController } from '@reown/appkit-controllers'

import { W3mAccountNftsWidget } from '../../src/partials/w3m-account-nfts-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const TITLE = 'nft-template-title'
const DESCRIPTION = 'nft-template-description'
const LINK_RECEIVE_FUNDS = 'link-receive-funds'

describe('W3mAccountNftsWidget', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('it should display basic content', async () => {
    const accountsNftsWidget: W3mAccountNftsWidget = await fixture(
      html`<w3m-account-nfts-widget></w3m-account-nfts-widget>`
    )
    const title = HelpersUtil.getByTestId(accountsNftsWidget, TITLE)
    const description = HelpersUtil.getByTestId(accountsNftsWidget, DESCRIPTION)

    expect(HelpersUtil.getTextContent(title)).toBe('Coming soon')
    expect(HelpersUtil.getTextContent(description)).toBe('Stay tuned for our upcoming NFT feature')
  })

  it('it should navigate to wallet receive view if link is clicked', async () => {
    vi.spyOn(RouterController, 'push')

    const accountsNftsWidget: W3mAccountNftsWidget = await fixture(
      html`<w3m-account-nfts-widget></w3m-account-nfts-widget>`
    )
    const link = HelpersUtil.getByTestId(accountsNftsWidget, LINK_RECEIVE_FUNDS)

    link.click()

    expect(RouterController.push).toHaveBeenCalledWith('WalletReceive')
  })
})
